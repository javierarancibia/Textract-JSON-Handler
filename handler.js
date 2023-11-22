const response = require('./response3.js');

const wordsDictionary = response.Blocks.filter((block) => block.BlockType === 'WORD').map((word) => ({ id: word.Id, confidence: word.Confidence, text: word.Text }));
console.log(wordsDictionary)
const cells = response.Blocks.filter(block => block.BlockType === 'CELL' || block.BlockType === 'MERGED_CELL' || block.BlockType === 'TABLE_TITLE' || block.BlockType === 'TABLE_FOOTER' )
const cellsDictionary = cells.map(cell => ({...cell, word: cell.Relationships && cell.Relationships[0].Ids.map(id => wordsDictionary.find(el => el.id === id)) }))

const tables = response.Blocks.filter((block) => block.BlockType === 'TABLE');
const structuredTables = tables.map(table => {
    return ({
        id: table.Id,
        data: table.Relationships.map(rel => ({ type: rel.Type, ids: rel.Ids.map(id => ({id, cell: cellsDictionary.find(cell => cell.Id === id) }) )}))
    }) 
})

const rowedTable = structuredTables.map(table => {
    const tableTitles = table.data.find(x => x.type === "TABLE_TITLE")
    const tableFooters = table.data.find(x => x.type === "TABLE_FOOTER")
    const childArray = table.data.find(x => x.type === "CHILD")
    const headers = childArray.ids.filter(x => 'EntityTypes'in x.cell && x.cell.EntityTypes.includes("COLUMN_HEADER"))
    const tableCells = childArray.ids.filter(x => !('EntityTypes'in x.cell) || 'EntityTypes'in x.cell && x.cell.EntityTypes.includes("TABLE_SECTION_TITLE")  || 'EntityTypes'in x.cell && x.cell.EntityTypes.includes("TABLE_SUMMARY"))
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
    return ({ type: "table", id: table.id, titles: tableTitles?.ids, headers, tableRows, footer: tableFooters?.ids })
})

const createTable = rowedTable => {
    const parsedTables =  rowedTable.map(element => {
        let tableTitles;
        if (!element.titles) {
            tableTitles = ""
        }
        if (element.titles) {
            const titles = element.titles.map(title => title.cell.word.map(x => x.text).join(' '))
            tableTitles = `<h2>${ titles }</h2>`
        }
        let thead;
        if (element.headers) {
            const th = element.headers.map(header => header.cell.word && (`<th colspan=${header.cell.ColumnSpan}>${header.cell.word.map(el => el.text).join(' ')}</th>`))
            thead = `<thead><tr>${ th.join('') }</tr></thead>`
        }
        let tbody;
        if (element.tableRows) {
            const tr = element.tableRows.map(row => (`<tr>${ row.map(data => data.cell.word ? (`<td style="border: 1px solid #dddddd; min-width:100px; text-align:center;background:${data.cell.Confidence < 90 ? "red" : "transparent"}" colspan=${data.cell.ColumnSpan}>${ data.cell.word.map(el => el && el.text !== undefined ? el.text : " ").join(' ') }</td>`) : "<td style='border: 1px solid #dddddd; min-width:100px;background:${data.cell.Confidence < 90 ? 'red' : 'transparent''></td>").join('')  }</tr>`))
            tbody = `<tbody>${ tr.join('') }</tbody>`
        }
        let tfooter;
        if (!element.footer) {
            tfooter = ""
        }
        if (element.footer) {
            const foot = element.footer.map(foot => foot.cell.word && (`<td colspan=${foot.cell.ColumnSpan}>${foot.cell.word.map(el => el.text).join(' ')}</td>`))
            tfooter = `<tfoot><tr>${ foot.join('') }</tr></tfoot>`
        }

        return tableTitles + '<table style="margin: 3rem 0;">' + thead + tbody + tfooter + '</table>'
    });
    return parsedTables.join("")
}
createTable(rowedTable)










// const tableHeaders = response.Blocks.filter(block => block.BlockType === 'CELL' && block.hasOwnProperty('EntityTypes')).filter(cell => cell.EntityTypes.some(x => x === 'COLUMN_HEADER'))
// const headers = tableHeaders.map(header => header.Relationships.map(rel => rel.Ids.map(id => wordsDictionary.find(el => el.id === id ))));
