const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
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



exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  if(req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
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



exports.getAllSauces = (req, res, next) => {
  Sauce.find()
      .then((sauces) => {res.status(200).json(sauces);})
      .catch((error) => {res.status(400).json({error: error});});
};

exports.likeSauce = (req, res, next) => {
  
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (req.body.like === 1) {
        sauce.usersLiked.push(req.body.userId)
        Sauce.updateOne(
          { _id: req.params.id },
          { likes: sauce.usersLiked.length, usersLiked: sauce.usersLiked }
        )

          .then(res.status(200).json({ message: 'You liked the sauce' }))
          .catch(error => res.status(500).json({ error }))
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