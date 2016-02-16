var phantom = require('phantom');
var swig  = require('swig');
var fs = require('fs');
var chess_storage = require('./chess_storage.js');

var chess_service = function(config) {

  var cs = {};
  cs.config = config||{};

  cdb = chess_storage(null);

  /**
   * Creates position settings based on position passed in.
   */
  cs.createPositionSettings = function(positionIn) {

    var imagePrefix = "<img src='img/";
    var imageSuffix = ".png'>";

    var positionSettings = {};

    for (var prop in positionIn) {
      positionSettings[prop] = imagePrefix + positionIn[prop] + imageSuffix;
    }

    return positionSettings;
  }

  /**
   * Write out the rendered template file as an .html file
   */
  cs.writeBoardTemplate = function(position, boardTemplateFile, boardHtmlFile) {

    swig.setDefaults({ cache: false, autoescape: false });

    // Compile the board template file
    var tpl = swig.compileFile(boardTemplateFile);

    // Render the position
    var rendered = tpl(position);

    // Write out the board file
    fs.writeFile(boardHtmlFile, rendered, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log('writting '+boardHtmlFile+' done');
    });
  }

  /**
   * Render the board html file as an image file (png)
   */
  cs.renderBoardImage = function(boardHtmlFile, boardImageFile, callback) {

    phantom.create("--ignore-ssl-errors=yes", "--ssl-protocol=any", "--web-security=no", function (ph) {
      ph.createPage(function (page) {
        // create page object
        page.set('viewportSize', {width:700,height:700}, function(){
          page.set('clipRect', {top:0,left:0,width:700,height:700}, function(){
            // open page
            page.open(boardHtmlFile, function(status) {
              // wait 1.5 seconds for webpage to be completely loaded
              setTimeout(function(){
                page.render(boardImageFile, function(finished){
                  console.log('rendering '+boardHtmlFile+' as '+boardImageFile+' done');
                  ph.exit();
                  callback(boardImageFile);
                });
              }, 1500);
            });
            // end 'open page'
          });
        });
        // end 'create page object'
      });
    });

  }

  /**
   * createBoardImage
   *   - Creates the board position settings
   *   - Write out the board html file, using the position and template
   *   - Render the board html file as an image
   */

  cs.createBoardImage = function(problem, callback) {

    console.log('in chessboard.build');

    var boardTemplateFile = "chessboard.tpl.html";
    var boardHtmlFile = "chessboard.html";
    var boardImageFile = "./problem_img/chessboard-"+problem.problem_id+".png";

    position = JSON.parse(problem.position);
    var ps = cs.createPositionSettings(position);
    cs.writeBoardTemplate(ps, boardTemplateFile, boardHtmlFile);
    cs.renderBoardImage(boardHtmlFile, boardImageFile, callback);

  }

  /**
   * Gets the problem image.
   */

  cs.getProblemImage = function(problemId, callback) {

    console.log('in chessboard.getProblemImage');

    cdb.problems.get(problemId, function(err, problem) {
      console.log('in cdb get for problemId = '+problemId);
      if (err != null) {
        console.log(err);
        callback("");
      }
      else if (problem.image !== "") {
        callback(problem.image);
      }
      else {
        console.log(problem);
      }
    });

  }

  /**
   * createProblem
   *   - Creates board image.
   *   - Saves problem to chess db.
   */
  cs.createProblem = function(problemPosition, callback) {

    var problemId = Math.floor((Math.random() * 1000) + 1);

    var problem = {problem_id: problemId, position: problemPosition, image: ""};

    cs.createBoardImage(problem, function(boardImageFile){

      console.log('in callback for cs.createProblem');
      console.log('boardImageFile = '+boardImageFile);

      problem.image = boardImageFile;
      cdb.problems.save(problem);

      callback(problem);

    });

  }

  return cs;

}

module.exports = chess_service;





