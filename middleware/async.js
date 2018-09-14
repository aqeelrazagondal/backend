module.exports = function (handler) {
    return async (req, rex, next) => {
      try{
        await handler(req, res);
      }catch(ex) {
        next(ex);
      }
    };  
}