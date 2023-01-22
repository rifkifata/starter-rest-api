const express = require('express')
const app = express()
const db = require('@cyclic.sh/dynamodb')

const { ObjectID } = require('mongodb');
//const ObjectID = require('mongodb').ObjectID

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

// Create or Update an item
app.post('/:col', async (req, res) => {
  console.log(req.body)

  const objectId = new ObjectID();
  const col = req.params.col
  //const key = req.params.key
  let key = objectId.toString()

  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).set(key, req.body)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Delete an item
app.delete('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).delete(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a single item
app.get('/getbykey/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  let item = await db.collection(col).get(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

//Get all full listing
 /*app.get('/getfull/:col', async (req, res) => {
   const col = req.params.col
   console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
   const items = await db.collection(col).list()
   console.log(JSON.stringify(items, null, 2))
   res.json(items).end()
 })*/

//get All
app.get('/getall/:col', async (req, res) => {
  const col = req.params.col
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  const items = await db.collection(col).list()
  let result = items.results.map(a => a.key)
  let currentArray = []
  
    await Promise.all(
        result.map(async (item) => {
            currentArray.push(await db.collection(col).get(item))
        })
    )

    currentArray.map(item => {
        Object.assign(item, item.props)
        delete item.props;
        return item
    })

    let finalResult = { "results": currentArray }
    res.json(finalResult).end()
})

// Update entire bike
app.put("/:col/:key", async (req, res) => {
    const key = req.params.key;

    // Make sure bike data exists
    if (!req.body) {
        throw new Error();
    }

    // Make sure bike has ID and handle
    if (!key) {
        throw new Error();
    }

    // Delete existing bike object
    await db.collection(col).delete(key)

    // Save new bike object
    const item = await db.collection(col).set(key, req.body)
    console.log(JSON.stringify(item, null, 2))
    res.json(item).end()

    res.send(bikeObject)
});

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})
