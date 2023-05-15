const fs = require('fs');

const fileLocation = `${__dirname}/../dev-data/data/tours-simple.json`;

const toursData = JSON.parse(fs.readFileSync(fileLocation, 'utf-8'));

exports.checkBody = (req, res, next) => {
  console.log(req.body);
  if (!req.body.price || !req.body.name) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid tour price or name',
    });
  }
  next();
};

exports.checkID = (req, res, next, val) => {
  if (!toursData[val]) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: toursData.length,
    data: {
      toursData: toursData,
    },
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: toursData[req.params.id],
    },
  });
};

exports.addTour = (req, res) => {
  let newId = toursData[toursData.length - 1].id + 1;
  console.log(newId);
  let newTour = Object.assign({ id: newId }, req.body);
  toursData.push(newTour);
  fs.writeFile(fileLocation, JSON.stringify(toursData), (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'Error writing file',
      });
    } else {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      toursData: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
