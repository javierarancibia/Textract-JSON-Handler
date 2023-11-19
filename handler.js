const response = require('./response.js');

const wordsDictionary = response.Blocks.filter((block) => block.BlockType === 'WORD').map((word) => ({ id: word.Id, confidence: word.Confidence, text: word.Text }));
const cells = response.Blocks.filter(block => block.BlockType === 'CELL')
const cellsDictionary = cells.map(cell => ({...cell, word: wordsDictionary.find(word => word.id === cell.Relationships[0].Ids[0]) }))
// console.log(cellsDictionary)

const tables = response.Blocks.filter((block) => block.BlockType === 'TABLE');
const structuredTables = tables.map(table => {
    return ({
        id: table.Id,
        data: table.Relationships[0].Ids.map(id => ({id, cell: cellsDictionary.find(cell => cell.Id === id) }))
    }) 
}) 
console.log(structuredTables[0].data)










// const tableHeaders = response.Blocks.filter(block => block.BlockType === 'CELL' && block.hasOwnProperty('EntityTypes')).filter(cell => cell.EntityTypes.some(x => x === 'COLUMN_HEADER'))
// const headers = tableHeaders.map(header => header.Relationships.map(rel => rel.Ids.map(id => wordsDictionary.find(el => el.id === id ))));
