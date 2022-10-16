import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Payble } from "../target/types/payble";
 
function shortKey(key: anchor.web3.PublicKey) {
  return key.toString().substring(0, 8);
}
 
describe("Payble", () => {
 
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Payble as Program<Payble>;
 
  async function generateKeypair() {
    let keypair = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      keypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await new Promise(resolve => setTimeout(resolve, 3 * 1000)); // Sleep 3s
    return keypair;
  }
 
  async function derivePda(name: string, pubkey: anchor.web3.PublicKey) {
    let [pda, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        pubkey.toBuffer(),
        Buffer.from("_"),
        Buffer.from(name)
      ],
      program.programId
    );
    return pda;
  }
 
  async function createTableAccount(
    name: string,
    pda: anchor.web3.PublicKey,
    wallet: anchor.web3.Keypair
  ) {
    await program.methods.createTable(name)
      .accounts({
        tableAccount: pda,
        wallet: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();
  }
 
  async function modifyTable(
    name: string,
    amountadd: number,
    wallet: anchor.web3.Keypair,
  ) {
 
    console.log("--------------------------------------------------");
    let data;
    let pda = await derivePda(name, wallet.publicKey);
 
    console.log(`Checking if account ${shortKey(pda)} exists for name: ${name}...`);
    try {
 
      data = await program.account.table.fetch(pda);
      console.log("It does.");
 
    } catch (e) {
 
      console.log("It does NOT. Creating...");
      await createTableAccount(name, pda, wallet);
      data = await program.account.table.fetch(pda);
    };
 
    console.log("Success.");
    console.log("Data:")
    console.log(`    Name: ${data.name}   Balance: ${data.amount}`);
    console.log(`Modifying balance of ${data.name} from ${data.amount} to ${amountadd}`);
 
    await program.methods.modifyTable(amountadd).accounts({
      tableAccount: pda,
      wallet: wallet.publicKey,
    });
 
    data = await program.account.table.fetch(pda);
    console.log("New Data:")
    console.log(`    Name: ${data.name}   Balance: ${data.amount}`);
    console.log("Success.");
  }
 
    it("An example of PDAs in action", async () => {
 
      const testKeypair1 = await generateKeypair();
 
      await modifyTable("table1", 4, testKeypair1);
      await modifyTable("table1", 2, testKeypair1);
 
      const testKeypair2 = await generateKeypair();
      await modifyTable("red", 3, testKeypair2);
      await modifyTable("green", 3, testKeypair2);
    });
  });
