import * as BufferLayout  from "@solana/buffer-layout";
import {
     ASSOCIATED_TOKEN_PROGRAM_ID ,
     getAssociatedTokenAddress ,
     TOKEN_PROGRAM_ID , 
 
    } from "@solana/spl-token" ;
import {
     Connection ,
     Keypair ,
     PublicKey ,
     SystemProgram ,
     SYSVAR_RENT_PUBKEY ,
     TransactionInstruction ,
     Transaction ,
     sendAndConfirmTransaction, 

    } from "@solana/web3.js" ;

import { CreateKeypairFormFile } from "./utils";

import fs from 'mz/fs' ;
import os from "os" ;
import path from "path" ;
import yaml  from "yaml" ;

//Path to local solona cli 
const   CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config' ,
    'solana' ,
    'cli' ,
    'config.yml'
); 

async function main() {
    
    const connection = new Connection ("https://api.devnet.solana.com" ,'confirmed');
    console.log('Successfully connected to devnet ') ;

    const configYml = await fs.readFile(CONFIG_FILE_PATH , {encoding : 'utf8'}) ;
    const KeypairPath =  await yaml.parse(configYml).keypair_path ;
    const wallet  = await CreateKeypairFormFile(KeypairPath) ;
    console.log ("Local account loaded succesfully");

    
    const   programKeypair  =  CreateKeypairFormFile(
        path.join(
            path.resolve(__dirname ,"./dist/program"),
            'mint-keypair.json'
        )
    );
    
      
    const programId =  (await programKeypair).publicKey ;
    console.log (`ProgramId : ${programId.toBase58()}`);
    

    //Derive mint address and asssociated token account address 
      const mintKeypair  :  Keypair =  Keypair.generate();
      const tokenaddresss = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey ,
      );
     
      console.log(`New Token : ${mintKeypair.publicKey} `  ) ;

      //trasact  with our program 

      const instruction = new TransactionInstruction({
        keys : [
            //mint account 
            {
                pubkey : mintKeypair.publicKey ,
                isSigner : true ,
                isWritable : true ,

            } ,
           //token_account
           {
            pubkey :  tokenaddresss,
            isSigner : false ,
            isWritable : true ,
            
           } ,
           //mint_autho
           {
            pubkey : wallet.publicKey ,
            isSigner : true ,
            isWritable :  false ,
            
           } ,
           //rent
           {
            pubkey : SYSVAR_RENT_PUBKEY ,
            isSigner : false ,
            isWritable :  false ,
           },
           //system_program
           {
            pubkey : SystemProgram.programId ,
            isSigner : false ,
            isWritable :  false ,
           },
           //token_program
           {
            pubkey :  TOKEN_PROGRAM_ID ,
            isSigner : false ,
            isWritable :  false ,
           },
           //associated_token
           {
            pubkey : ASSOCIATED_TOKEN_PROGRAM_ID ,
            isSigner : false ,
            isWritable :  false ,
           }
        ],

        programId : programId ,
        data : Buffer.alloc(0)
      });

      await sendAndConfirmTransaction(
        connection,
        new Transaction ().add( instruction),
        [wallet , mintKeypair],
      );
      

}  

main().then(
  () =>  process.exit(),
  err =>{
       console.log (err);
       process.exit(-1) ;
    }
);

