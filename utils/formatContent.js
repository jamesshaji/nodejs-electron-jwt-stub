/**
* Print formated informational/Error/ warning message to client
* @author: James
* Creationdate: Nov 12, 2018
*
*
* Edits
* ------------------------------------------
* EditDate:
* EditReason:
* @author:
* ------------------------------------------
*/

module.exports.formatOutput = (res, type, httpCode, message, data) => {
  let responseData = {
    meta: {
      type: type,                 //Success or failure based on query or request
      code: httpCode,             //Appropriate HTTP code as response
      message: message            //End user friendly message to be displayed by client
    },
    data: data                    //Data to be send to the client based on request
  };
  res.status(httpCode).send(responseData);
  return;
};
