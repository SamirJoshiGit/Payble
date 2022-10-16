use anchor_lang::prelude::*;
use std::mem::size_of;
 
declare_id!("4MF6qojdvBhF9GSzQeCVFJ1it7FN3dN6d9DMGbmPwDGm");
 
#[program]
pub mod payble {
    use super::*;
 
    pub fn create_table(ctx: Context<CreateTable>, name: String) -> Result<()> {
        // Get Escrow Account
        let table_account = &mut ctx.accounts.table_account;
 
        // set amount
        table_account.amount = 0;
 
        table_account.name = name;
 
        Ok(())
    }
 
    pub fn modify_table(ctx: Context<CreateTable>, amount_added: u16)-> Result<()>{
        let table_account = &mut ctx.accounts.table_account;
        table_account.amount = table_account.amount + amount_added;
        Ok(())
    }
 
}
 
#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateTable<'info> {
    // Escrow Account PDA
    #[account(
        init,
        payer = wallet,
        space = 82,
        seeds = [wallet.key().as_ref(), b"_", name.as_ref()],
        bump,
    )]
    pub table_account: Account<'info, Table>,
 
    #[account(mut)]
    pub wallet: Signer<'info>,
 
    pub system_program: Program<'info, System>,
}
 
#[derive(Accounts)]
pub struct ModifyTable<'info> {
    #[account(mut)]
    pub table_account: Account<'info, Table>,
    #[account(mut)]
    pub wallet: Signer<'info>
}
 
#[account]
pub struct Table {
    // Amount that is owed by table_account
    pub name: String,
    //String of table_account name
    pub amount: u16,
}
 
 
