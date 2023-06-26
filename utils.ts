import   {Keypair}   from "@solana/web3.js" ;
import fs from 'mz/fs' ;
import { NodeBuilderFlags } from "typescript";


export async function  CreateKeypairFormFile(
   filePath : string,

): Promise<Keypair>{
    
      
    const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });  
    const  secretKey = Uint8Array.from(JSON.parse( secretKeyString));
    return Keypair.fromSecretKey(secretKey);
} 








