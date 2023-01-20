const express = require('express')
const app = express()
const db = require('@cyclic.sh/dynamodb')

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
app.post('/:col/:key', async (req, res) => {
  console.log(req.body)

  const col = req.params.col
  const key = req.params.key
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
app.get('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).get(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a full listing
// app.get('/:col', async (req, res) => {
//   const col = req.params.col
//   console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
//   const items = await db.collection(col).list()
//   console.log(JSON.stringify(items, null, 2))
//   res.json(items).end()
// })
  
//get all
  app.get('/:col', async (req, res) => {
    const col = req.params.col
    //console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
    const items = await db.collection(col).list()
    //const item = await db.collection(col).get(key)
    //console.log(JSON.stringify(items, null, 2))
    console.log(col) //nama colom (cekgung)
    console.log(items) 
    // {
    //   results: [
    //     { collection: 'cekgung', key: 'id', props: [Object] },
    //     { collection: 'cekgung', key: 'asu', props: [Object] },
    //     { collection: 'cekgung', key: 'asu2', props: [Object] }
    //   ]
    // }
    arrayA = items.results
    arrayA.map(function(value) {
      return value.key
    });
    console.log(arrayA)
    res.json(items).end()
    //let akhir = res.json(items).end()
    //let array = []
    //for (){
    //  array.push(value)
    //}
    //console.log(array)
  })

  var dynamoClient = db.DocumentClient();
  var params = {
    TableName: col, // give it your table name 
    Select: "ALL_ATTRIBUTES"
  };

  dynamoClient.scan(params, function(err, data) {
    if (err) {
       console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
       console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
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
