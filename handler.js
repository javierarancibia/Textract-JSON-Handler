const response = require('./response.js');

const wordsDictionary = response.Blocks.filter((block) => block.BlockType === 'WORD').map((word) => ({ id: word.Id, confidence: word.Confidence, text: word.Text }));
const cells = response.Blocks.filter(block => block.BlockType === 'CELL')
const cellsDictionary = cells.map(cell => ({...cell, word: wordsDictionary.find(word => word.id === cell.Relationships[0].Ids[0]) }))

const tables = response.Blocks.filter((block) => block.BlockType === 'TABLE');
const structuredTables = tables.map(table => {
    return ({
        id: table.Id,
        data: table.Relationships[0].Ids.map(id => ({id, cell: cellsDictionary.find(cell => cell.Id === id) }))
    }) 
})

const rowedTable = structuredTables.map(table => {
    const headers = table.data.filter(x => 'EntityTypes'in x.cell && x.cell.EntityTypes.includes("COLUMN_HEADER"))
    const tableCells = table.data.filter(x => x.cell.RowIndex !== 1)
    const tableRows = tableCells.reduce((acc, item) => {
        // If the array for the current rowIndex doesn't exist, create it
        if (!acc[item.cell.RowIndex]) {
          acc[item.cell.RowIndex] = [];
        }
      
        // Push the current item to the array for the current rowIndex
        acc[item.cell.RowIndex].push({ id: item.id, cell: item.cell });
        return acc;
    }, []).filter(x => x !== 'undefined');

    // Crear array para cada 
    return ({ type: "table", headers, tableRows })
})

console.log(rowedTable[0])










// const tableHeaders = response.Blocks.filter(block => block.BlockType === 'CELL' && block.hasOwnProperty('EntityTypes')).filter(cell => cell.EntityTypes.some(x => x === 'COLUMN_HEADER'))
// const headers = tableHeaders.map(header => header.Relationships.map(rel => rel.Ids.map(id => wordsDictionary.find(el => el.id === id ))));
