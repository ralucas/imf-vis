var mongoose = require('mongoose');

var subjectSchema = mongoose.Schema({
  WEO_Country_Code: String,
  Country: String,
  ISO: String,
  WEO_Subject_Code: String,
  Subject_Descriptor: String,
  Subject_Notes: String,
  Units: String,
  Scale: String,
  County_Series_Specific_Notes: String,
  AnnualData: [{
    Year: Number,
    Data: Number
  }]
});
  
module.exports = mongoose.model('Subject', subjectSchema);
