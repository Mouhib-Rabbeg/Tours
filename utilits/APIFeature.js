class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //CREATE HARD COPY FROM QUERY OBJECT
    const queryObj = { ...this.queryString };
    //EXCLUED FILEDS FROM THE QUERY
    const excluededFields = ['page', 'sort', 'limit', 'fields'];

    //DELETE EXCLUDED FILED FROM THE QUERY OBJECT
    excluededFields.forEach(el => delete queryObj[el]);

    //1) FILTERING
    //ADD MONGO OPERATORS
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      matchedstr => `$${matchedstr}`
    );

    //BUILD THE QUER
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      /*
        In case sort multuple values 
        sorted =req.query.sort.split(',').join(' ');
        query = query.sort(sorted)
        */
      this.query = this.query.sort(this.queryString.sort);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFiled() {
    if (this.queryString.fields) {
      let limtedquery = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(limtedquery);
    } else {
      // minus for excluding v
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeature;
