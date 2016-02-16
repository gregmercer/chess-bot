var Botkit = require('botkit');
var fs = require('fs');
var path = require('path');
var cs = require('./chess_service.js')();

/**
 * Create the chess bot controller
 */
var controller = Botkit.slackbot({
  debug: false,
  //debug: 4,
});

/**
 * Create the chess bot
 *   - connect the bot to a stream of messages
 */
var chess_bot = controller.spawn({
  token:process.env.token,
}).startRTM()

/**
 * Handle '@chess new' messages
 */
controller.hears('new','direct_message,direct_mention,mention',function(chess_bot,message) {
  chess_bot.startPrivateConversation(message, newProblem);
});

/**
 * Handle '@chess problem' messages
 */
controller.hears('problem','direct_message,direct_mention,mention',function(chess_bot,message) {
  chess_bot.startPrivateConversation(message, displayProblem);
});

/**
 * Handle '@chess help' messages
 */
controller.hears('help','direct_message,direct_mention,mention',function(chess_bot,message) {
  chess_bot.reply(message,'chess help:\n@chess list - list of chess problems available');
});

/**
 *
 */
var newProblem = function(response, dm) {

  var askText = 'Enter the problem position?\n';

  dm.ask(askText, function(response, dm) {

    var channels = dm.source_message.channel;
    var problemPosition = response.text;

    cs.createProblem(problemPosition, function(problem) {

      console.log('in callback for cs.build');
      console.log('problem.image = '+problem.image);

      if (problem.image !== "") {
        displayBoard(problem.image, channels);
      }

    });

    dm.next();
  });

}

/**
 *
 */
var displayProblem = function(response, dm) {

  var askText = 'Enter the problem id?\n';

  dm.ask(askText, function(response, dm) {

    var channels = dm.source_message.channel;
    var problemId = response.text;

    cs.getProblemImage(problemId, function(problemImage) {
      if (problemImage !== "") {
        displayBoard(problemImage, channels);
      }
    });

    dm.next();

  });

}

/**
 *
 */
var displayBoard = function(boardImageFile, channels) {
  var slack_file = {
    file: fs.createReadStream(path.join(__dirname, '', boardImageFile)),
    filename: boardImageFile,
    title: 'Board: '+boardImageFile,
    initialComment: 'chessboard problem 123',
    channels: channels,
  }
  chess_bot.api.files.upload(slack_file,function(err,res) {
    //console.log(err);
    //console.log(res);
  });
}



