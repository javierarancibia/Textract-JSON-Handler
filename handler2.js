const response = require('./response.js');

const table = response.Blocks.filter(block => block.BlockType === "TABLE").map(table => {
    // TABLE TITLE
    const tableTitles = table.Relationships.find(rel => rel.Type === "TABLE_TITLE")
    const titlesIds = tableTitles.Ids.map(id => response.Blocks.find(block => block.Id === id))
    const titleWords = titlesIds.map( x => x.Relationships.map(title => title.Ids.map(relId => response.Blocks.find(block => block.Id === relId) ) ))
    return tableTitles
    // return { table: table.Id, titles: titleWords.flat().flat() }
})
console.log(table)