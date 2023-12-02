const response = require('./response.js');

try {
    // GET ALL TABLE BLOCKS
    const tables = response.Blocks.filter(
        table =>
        table.BlockType === 'TABLE' &&
        table.Confidence >
            (options && options.minConfidence ? options.minConfidence : 0)
    );
    // GET ALL CELL BLOCKS
    const getCells = id => {
        return response.Blocks.filter(cells => cells.BlockType === 'CELL').filter(
        cell => cell.Id === id
        );
    };
    // GET ALL WORD BLOCKS
    const getAllWords = response.Blocks.filter(word => word.BlockType === 'WORD');
        
    // GET ALL SELECTS BLOCKS
    const getAllSelects = response.Blocks.filter(
    select => select.BlockType === 'SELECTION_ELEMENT'
    );

    const getWords = childIds => {
    return childIds.Ids.map(id => {
        return getAllWords.filter(word => {
        return word.Id === id;
        });
    });
    };

    const getSelects = childIds => {
    return childIds.Ids.map(id => {
        return getAllSelects.filter(word => {
        return word.Id === id;
        });
    });
    };

    const buildWords = words => {
    return words.reduce((fullKey, [word]) => {
        return `${fullKey} ${word.Text}`.trim();
    }, '');
    };

    const allTables = [];
    tables.forEach(table => {
        const [tableRelationshipIds] = table.Relationships.map(rel => rel.Ids);
        const cellArray = [];
        let tableCells = null;
        tableRelationshipIds.forEach(tableRelationshipId => {
        tableCells = getCells(tableRelationshipId);

        tableCells.forEach(tableCell => {
            const cellIds = tableCell.Relationships;
            // For each id in the child relationships go get the words
            if (cellIds) {
            cellIds.forEach(child => {
                const words = getWords(child);
                // Using reduce to turn the list of words into one line
                const [[selects]] = getSelects(child);
                if (selects) {
                cellArray.push(selects.SelectionStatus);
                } else {
                const completedWord = buildWords(words);
                cellArray.push(completedWord);
                }
            });
            } else {
            cellArray.push('NA');
            }
        });
        });

        const NumberOfColumnsInTable = Math.max(
        ...tableCells.map(tableCell => tableCell.ColumnIndex)
        );

        const tableArray = [];
        [cellArray].forEach(cell => {
        while (cell.length) {
            tableArray.push(cell.splice(0, NumberOfColumnsInTable));
        }
        });

        allTables.push(tableArray);
    });

    const tableRowsAsobjects = [];
    allTables.forEach(table => {
        const headers = table.shift(); // takes first element of array, which is also an array
        const objects = table.map(tableRows => {
        return headers.reduce(
            (accumulator, currentHeaderValue, initialValue) => {
            accumulator[currentHeaderValue] = tableRows[initialValue];
            return accumulator;
            },
            {}
        );
        });
        tableRowsAsobjects.push(objects);
    });

    console.log(tableRowsAsobjects);
} catch (error) {
    return error;
}
    

