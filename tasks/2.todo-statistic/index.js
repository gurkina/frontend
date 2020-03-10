const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');
const os = require("os");

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);


function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function getComments(files) {
    let comments = [];

    const target = '\/\/ TODO ';

    for (const file of files) {
        let strArray = file.split(os.EOL);

        for (let str of strArray) {
            let idx = str.indexOf(target);
            if(idx === -1){
                continue;
            }
            str = str.slice(idx);
            let [author, dateString, importance] = str.replace(target, '').split(';');
            author = author.trim();
            dateString = (dateString !== undefined) ? dateString.trim() : '';
            let date = (dateString !== '') ? new Date(dateString) : null;
            importance = countImportance(str);
        
            const commentObject = {
                author: author,
                date: date,
                importance: importance,
                fullComment: str,
            };

        comments.push(commentObject);
        }
    }
    return comments;
}

function countImportance(comment) {
	let importanceCount = 0;
	if(!comment.match(/!/g)) {
		return 0;
    }
    
	for(let i = 0; i < (comment.match(/!/g).length); i++) {
        importanceCount++;
    }
    
	return importanceCount;	
}

function getCollection(comments) {
    
    return commentsFunction = {
        getAll () {
            return comments.map(comment => comment.fullComment);
        },
        getImportant () {
            return comments
                .filter(comment => comment.importance > 0)
                .map(comment => comment.fullComment);
        },
        getCommentsByUser(username) {
            return comments
                .filter(comment => comment.author === username)
                .map(comment => comment.fullComment);
        },
        getSortByImportance () {
            return comments
                .sort((a, b) => b.importance - a.importance)
                .map(comment => comment.fullComment);
        },
        getSortByDate () {
            return comments
                .sort((a, b) => b.date - a.date)
                .map(comment => comment.fullComment);
        },
        getSortedByAuthor () {
            const sortedComments = comments.sort((a, b) => {
                let authorA = a.author.toLowerCase(); 
                let authorB = b.author.toLowerCase();
                
                if (authorA < authorB){
                      return -1;
                  }
                 if (authorA > authorB){
                      return 1;
                  }
                return 0;
            });
            return sortedComments.map(comment => comment.fullComment);
        }
    }
}

function processCommand(command) {
    const commandArgs = command.split(' ');
    const comments = getComments(files);
    const commentsCollection = getCollection(comments);

    switch (commandArgs[0]) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            const allComments = commentsCollection.getAll();
            console.log(allComments);
            break;
        case 'important':
            const importantComments = commentsCollection.getImportant();
            console.log(importantComments);
            break;
        case 'user': 
            if (commandArgs.length !== 2) {
                console.error("Wrong arguments count!");
                break;
            }
            const nameFromCommand = commandArgs[1];
            const name = nameFromCommand[0].toUpperCase() + nameFromCommand.slice(1).toLowerCase();
            
            const userComments = commentsCollection.getCommentsByUser(name);
            console.log(userComments);
            break;
        case 'sort':
            if (commandArgs.length !== 2) {
                console.error("Wrong arguments count!");
                break;
            };
            switch (commandArgs[1]) {
                case 'user':
                    const sortedAuthorComments = commentsCollection.getSortedByAuthor();
                    console.log(sortedAuthorComments);
                    break;
                case 'importance':
                    const sortedImportantComments = commentsCollection.getSortByImportance();
                    console.log(sortedImportantComments);
                    break;
                case 'date':
                    const sortedDateComments = commentsCollection.getSortByDate();
                    console.log(sortedDateComments);
                    break;
                default:
                    console.error("Unknown sorting param!");
                    break;
            };
        default:
            console.log('wrong command');
            break;
    }
}
