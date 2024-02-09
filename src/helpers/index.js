// This file exports a set of helper functions

// Function to parse command from message
function parseCommand(message) {
    return message.text.split(' ')[0].substring(1);
}

// Function to parse arguments from message
function parseArgs(message) {
    return message.text.split(' ').slice(1);
}

// Export the helper functions
module.exports = {
    parseCommand,
    parseArgs
};