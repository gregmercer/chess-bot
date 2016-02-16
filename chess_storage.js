var Store = require("jfs");

module.exports = function(config) {

  if (!config) {
    config = {
      path: "./",
    }
  }

  var problems_db = new Store(config.path + "/problems",{saveId: 'problem_id'});
  var answers_db = new Store(config.path + "/answers",{saveId: 'problem_id'});

  var storage = {
    problems: {
      get: function(problem_id,cb) {
        problems_db.get(problem_id,cb);
      },
      save: function(problem,cb) {
        problems_db.save(problem.problem_id,problem,cb);
      },
      all: function(cb) {
        problems_db.all(cb)
      }
    },
    answers: {
      get: function(problem_id,cb) {
        answers_db.get(problem_id,cb);
      },
      save: function(answer,cb) {
        answers_db.save(answer.problem_id,answer,cb);
      },
      all: function(cb) {
        answers_db.all(cb)
      }
    },
  };

  return storage;

}
