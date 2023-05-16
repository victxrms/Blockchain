import { TezosToolkit } from '@taquito/taquito';
import fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

let lastBlock = null;

async function main() {
  try {
    const rpc = 'https://api.tez.ie/rpc/mainnet';
    const Tezos = new TezosToolkit(rpc);
    const block = await Tezos.rpc.getBlock();

    Tezos.rpc.subscribeToHead({}).on('data', async (block) => {
      console.log('Último bloque:', block.header.level);
      console.log('Timestamp:', block.header.timestamp);
      console.log('Hash del bloque:', block.hash);


    if (lastBlock !== null && block.hash !== lastBlock.hash) {
      // Crear objeto con el bloque y su timestamp
      const blockData = {
        block: block,
        timestamp: block.header.timestamp
      };

      // Leer el archivo JSON existente (si existe)
      let existingData = [];
      try {
        const jsonData = await readFileAsync('bloques.json', 'utf8');
        existingData = JSON.parse(jsonData);
      } catch (error) {
        // El archivo no existe o está vacío
      }

      // Agregar el nuevo bloque al arreglo
      existingData.push(blockData);

      // Guardar el arreglo actualizado en el archivo JSON
      const data = JSON.stringify(existingData, null, 2);
      await writeFileAsync('bloques.json', data);
      console.log('Bloque guardado en bloques.json');
    }

    lastBlock = block;
  });
  } catch (error) {
    console.error('Error:', error);
  } 
}

main();
