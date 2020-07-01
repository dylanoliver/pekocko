// Call the sauce model & file-system plugin
// fs gives us access to functions which allow us to modify the file system, including functions for deleting files.
const Sauce = require('../models/sauce');
const fs = require('fs');

// function to enable sauce creation
// Grab all the information inside the sauce input fields
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  // Remove the _id, we'll get one by default from mongoDB
  delete sauceObject._id;
  const sauce = new Sauce({
    // All the input values are put into an item
    ...sauceObject,
    // And we add the imageUrl to the image
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Review saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// Function to load information when selecting a specific sauce
exports.getOneSauce = ('/:id', (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
});

// Function to enable sauce modification
exports.modifySauce = (req, res, next) => {
  // We grab all the information from the selected sauce
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  // And then we replace the existing sauce information by whatever modifications were made
  if(req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          // This new information is then pushed to the DB
          Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id })
            .then(() => {res.status(201).json({message: 'Sauce updated!'});})
            .catch((error) => {res.status(400).json({error: error});});
        })
      })
      .catch((error) => {res.status(500).json({error: error});});
  } else {
    Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id })
      .then(() => {res.status(201).json({message: 'Sauce updated!'});})
      .catch((error) => {res.status(400).json({error: error});});
  }
};

// Function to allow sauce deletion
// Once you've selected the sauce you want to delete
// The function deletes the sauces' image from the DB
// And then it deletes the information pertaining to said sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
              Sauce.deleteOne({ _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Sauce deleted!'}))
                  .catch(error => res.status(400).json({ error }));
          });
      })    
      .catch((error) => {res.status(500).json({error: error});});
};

// Function that fetches all existing sauces from the database and shows them on the main page
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
      .then((sauces) => {res.status(200).json(sauces);})
      .catch((error) => {res.status(400).json({error: error});});
};

exports.likeSauce = (req, res, next) => {
  
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
       // if like = 1, adding userId to usersLiked and update likes
      if (req.body.like === 1) {
        sauce.usersLiked.push(req.body.userId)
        Sauce.updateOne(
          { _id: req.params.id },
          { likes: sauce.usersLiked.length, usersLiked: sauce.usersLiked }
        )
          .then(res.status(200).json({ message: 'You liked the sauce' }))
          .catch(error => res.status(500).json({ error }))
        // if like = -1, adding userId to usersDisliked and update dislikes  
      } else if (req.body.like === -1) {
        sauce.usersDisliked.push(req.body.userId)
        Sauce.updateOne(
          { _id: req.params.id },
          {
            dislikes: sauce.usersDisliked.length,
            usersDisliked: sauce.usersDisliked
          }
        )
          .then(res.status(200).json({ message: 'You did not like the sauce' }))
          .catch(error => res.status(500).json({ error }))
          // if like = 0, removing userId from usersLike and usersDisliked and update dislikes
      } else if (req.body.like === 0) {
        if (sauce.usersLiked.includes(req.body.userId)) {
          const indexUserId = sauce.usersLiked.indexOf(req.body.userId)

          sauce.usersLiked.splice(indexUserId, 1)
          Sauce.updateOne(
            { _id: req.params.id },
            {
              usersLiked: sauce.usersLiked,
              likes: sauce.usersLiked.length
            }
          )

            .then(
              res.status(200).json({ message: 'You did not give any feedback' })
            )
            .catch(error => res.status(500).json({ error }))
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          const indexUserId = sauce.usersDisliked.indexOf(req.body.userId)
          sauce.usersDisliked.splice(indexUserId, 1)
          Sauce.updateOne(
            { _id: req.params.id },
            {
              usersDisliked: sauce.usersDisliked,
              dislikes: sauce.usersDisliked.length
            }
          )
            .then(
              res.status(200).json({ message: 'You did not give any feedback' })
            )
            .catch(error => res.status(500).json({ error }))
        }
      }
    })
    .catch(error => res.status(500).json({ error }))
};