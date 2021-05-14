const inquirer = require('inquirer');

module.exports = {
  askUABCredentials: () => {
    const questions = [
      {
        name: 'username',
        type: 'input',
        message: 'Enter your UAB username:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your username.';
          }
        }
      },
      {
        name: 'password',
        type: 'password',
        message: 'Enter your password:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your password.';
          }
        }
      }
    ];

    return inquirer.prompt(questions);
  },
};
