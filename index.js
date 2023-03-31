const express = require('express')
const app = express()
const db = require('@cyclic.sh/dynamodb')
const { momen } = require('mongodb');
const { ObjectID } = require('mongodb');
const request = require('request-promise');
const rp = require('request-promise');
var EventEmitter = require("events").EventEmitter;
const axios = require('axios');
// var admin = require("firebase-admin");
// var serviceAccount = require("privateKey.json");
// const certPath = admin.credential.cert(serviceAccount);
// var FCM = require('fcm-node');
// var serverKey = 'AAAAegb2XO8:APA91bFkBAnP0QZalGJOkDOiKcTlreKr35f9WKsJgVa_LAq4YTjp6lvrL1lLXoWLmYsjNoqjAUKZbhN1wv5j5fNs0prnEHXH4bSHT2FORv_Jirs-0BelhttmBCSHev4bkspkr6L0O_89';
// var fcm = new FCM(serverKey);


//const ObjectID = require('mongodb').ObjectID

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
    const now = new Date();
    let date = {
        "createdAt": now.toISOString(),
        "updatedAt": now.toISOString()
    }
    const isi = {...req.body, ...date}

  const objectId = new ObjectID();
  const col = req.params.col
  //const key = req.params.key
  let key = objectId.toString()

  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).set(key, isi)
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
    let props = item.props
    delete props.updated
    delete props.created
    let newitem = {
        key: key,
        collection : col,
        ...props
    }
  console.log(JSON.stringify(newitem, null, 2))
  res.json(newitem).end()
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
    const key = req.params.key
    const col = req.params.col
    const now = new Date()

    // get createdAt and updatedAt
    let oldDate = await db.collection(col).get(key)
    let createdAtOld = oldDate.props.createdAt
    let updatedAtOld = oldDate.props.updatedAt

    if (req.body.updatedAt) {
      const mydate = req.body.updatedAt
      updatedAtOld = new Date(mydate).toISOString()
    } else {
      updatedAtOld = now.toISOString()
    }

    // Delete existing object
    await db.collection(col).delete(key)
    
    //isi
    const isi = {
      ...req.body,
      "updatedAt" : updatedAtOld,
      "createdAt" : createdAtOld
    }
    // Save new Object
    const item = await db.collection(col).set(key, isi)
    console.log(JSON.stringify(item, null, 2))
    res.json(item).end()
});


app.get('/anyapi', async function (req, res, next) {
        const result1 = await axios
            .post('https://www.tiket.com/ms-gateway/tix-flight-search/search/streaming', {
                "requestItems": [
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jEyKEf0T6jhTqogS5QSHqaYrI93wNWcFgvlTINGpM46o",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jLJA7G0QaH2lAceGwyf3U1_4b0L8ASmzc_7PDvdyRUJU",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jsZTjBPHUZI1-Z4R_iKFMXxfHNutk_VfNMuvSOh9Is8U",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jBhQe6cYOekGwRW9bW7d4q6AHAbvXkTLlNHenCht5_QA",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jfT2S06WdIqQZ3PxOij-QJ4FN3lWa0iJRoLYDIgdaepc",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6j7ytyvBHbceP3Fv6SOLprErdxmu5IbitoiyoH64jZW_4",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jQcFkuVgmkD-vgJbX-5UZZk2MgiDxbJ0Qn1UevSC_8L4",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jO4DCz8FpWgc5Bwk1SfOf4tYwY6dEMnWHK-sTk-3UphU",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jxqbRAcl2osE9aR2Gi4E1y7Uc4Wq86__lZPRLOSfKeDI",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jW2u-qtqQETUbifXhloSnMRbRxwLtcCeYWI_0U1gT36Q",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jtYNWEaUSautd39NbkdFB5MmAOZV_-BrCCgWVYMd6AKA",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5F56DDSTjnGj7Jj83x6wUTzSylhVHYESAlOxAVNI2uC54",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5FPa2yi99nvCF8GJSEq05WJitZ72iyTL_MyOyTc2bDhDE",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5Fl7jvkN-a2PPCCugcctPaVygjQUgs6aG0KTGsXRER_Ow",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5FDf8hYPtF_Ak1NfOpio_Ncn4-TuhK132lkEIETeIszPc",
                    "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5F3tBy-IOVg95Tpcr9ahVaSQNMZ8tkYAWZX6vrE_B5-js"
                ]
            })
            .then(response => {
                let arr = response.data.data.searchList.departureFlights.map(({ marketingAirline, fareDetail, departure }) => ({ maskapai: marketingAirline.displayName, harga: fareDetail.cheapestFare, tanggal: departure.date }));
                const sorting = arr.sort(function (a, b) { return a.harga - b.harga });
                res.json(sorting);
                const top = sorting.slice(0, 1);
                //console.log(top);
                const maskapai = top.map(({ maskapai }) => maskapai)
                const harga = top.map(({ harga }) => harga)
                const tanggal = top.map(({ tanggal }) => tanggal)
                let msg = 'halo ikyganteng, ada maskapai *' + maskapai + '* seharga *' + harga + '* ditanggal *' + tanggal + '* , nih kyyy';

                return msg
            });
    console.log(result1);
    const result2 = await axios.post('https://api.callmebot.com/whatsapp.php?phone=6285277494909&text=' + result1 + 'apikey=5017646', { 'Host': 'api.callmebot.com' })
    return result2;
    ///

/*
    var body = new EventEmitter();
    await request({
        url: "https://www.tiket.com/ms-gateway/tix-flight-search/search/streaming",
        method: "POST",
        json: {
            "requestItems": [
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jEyKEf0T6jhTqogS5QSHqaYrI93wNWcFgvlTINGpM46o",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jLJA7G0QaH2lAceGwyf3U1_4b0L8ASmzc_7PDvdyRUJU",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jsZTjBPHUZI1-Z4R_iKFMXxfHNutk_VfNMuvSOh9Is8U",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jBhQe6cYOekGwRW9bW7d4q6AHAbvXkTLlNHenCht5_QA",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jfT2S06WdIqQZ3PxOij-QJ4FN3lWa0iJRoLYDIgdaepc",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6j7ytyvBHbceP3Fv6SOLprErdxmu5IbitoiyoH64jZW_4",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jQcFkuVgmkD-vgJbX-5UZZk2MgiDxbJ0Qn1UevSC_8L4",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jO4DCz8FpWgc5Bwk1SfOf4tYwY6dEMnWHK-sTk-3UphU",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jxqbRAcl2osE9aR2Gi4E1y7Uc4Wq86__lZPRLOSfKeDI",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jW2u-qtqQETUbifXhloSnMRbRxwLtcCeYWI_0U1gT36Q",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jtYNWEaUSautd39NbkdFB5MmAOZV_-BrCCgWVYMd6AKA",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5F56DDSTjnGj7Jj83x6wUTzSylhVHYESAlOxAVNI2uC54",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5FPa2yi99nvCF8GJSEq05WJitZ72iyTL_MyOyTc2bDhDE",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5Fl7jvkN-a2PPCCugcctPaVygjQUgs6aG0KTGsXRER_Ow",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5FDf8hYPtF_Ak1NfOpio_Ncn4-TuhK132lkEIETeIszPc",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5F3tBy-IOVg95Tpcr9ahVaSQNMZ8tkYAWZX6vrE_B5-js"
            ]
        }
    }, function (error, response, data) {
        body.data = data;
        body.emit('update');
    });

    body.on('update', async function () {
        let arr = body.data.data.searchList.departureFlights.map(({ marketingAirline, fareDetail, departure }) => ({ maskapai: marketingAirline.displayName, harga: fareDetail.cheapestFare, tanggal: departure.date }));
        const sorting = arr.sort(function (a, b) { return a.harga - b.harga });
        res.json(sorting);

        //call top object of array
        const top = sorting.slice(0, 1);
        //console.log(top);
        const maskapai = top.map(({ maskapai }) => maskapai)
        const harga = top.map(({ harga }) => harga)
        const tanggal = top.map(({ tanggal }) => tanggal)
        let msg = 'halo ikyganteng, ada maskapai *' + maskapai + '* seharga *' + harga + '* ditanggal *' + tanggal + '* , nih kyyy';
        
    })

    request({
        headers: {
            'Content-Type': 'application/json',
            'Host' : 'api.callmebot.com'
        },
        //url: "https://api.green-api.com/waInstance1101805072/SendMessage/954ba1ea96ed4a2cb99d655ba09984814564f0bbf1a6456cae",
        url: "https://api.callmebot.com/whatsapp.php?phone=6285277494909&text=ikyganteng&apikey=5017646",
        method: "POST",
        json: {
            "chatId": "6285277494909@c.us",
            "message": "ikyagnteg"
        }
    }, function (error, response, data) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('data:', data); // Print the HTML for the Google homepage.
    });

*/

    // await request({
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   url : "https://api.green-api.com/waInstance1101805072/SendMessage/954ba1ea96ed4a2cb99d655ba09984814564f0bbf1a6456cae",
    //   method: "POST",
    //   json: {
    //     "chatId": "6285277494909@c.us",
    //     "message": msg}
    //   }, function(error, response, data) {
    //     console.error('error:', error); // Print the error if one occurred
    //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //     console.log('data:', data); // Print the HTML for the Google homepage.
    // });
});

function getData() {
    var body = new EventEmitter();
    request({
        url: "https://www.tiket.com/ms-gateway/tix-flight-search/search/streaming",
        method: "POST",
        json: {
            "requestItems": [
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jEyKEf0T6jhTqogS5QSHqaYrI93wNWcFgvlTINGpM46o",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jLJA7G0QaH2lAceGwyf3U1_4b0L8ASmzc_7PDvdyRUJU",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jsZTjBPHUZI1-Z4R_iKFMXxfHNutk_VfNMuvSOh9Is8U",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jBhQe6cYOekGwRW9bW7d4q6AHAbvXkTLlNHenCht5_QA",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jfT2S06WdIqQZ3PxOij-QJ4FN3lWa0iJRoLYDIgdaepc",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6j7ytyvBHbceP3Fv6SOLprErdxmu5IbitoiyoH64jZW_4",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jQcFkuVgmkD-vgJbX-5UZZk2MgiDxbJ0Qn1UevSC_8L4",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jO4DCz8FpWgc5Bwk1SfOf4tYwY6dEMnWHK-sTk-3UphU",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jxqbRAcl2osE9aR2Gi4E1y7Uc4Wq86__lZPRLOSfKeDI",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jW2u-qtqQETUbifXhloSnMRbRxwLtcCeYWI_0U1gT36Q",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jtYNWEaUSautd39NbkdFB5MmAOZV_-BrCCgWVYMd6AKA",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5F56DDSTjnGj7Jj83x6wUTzSylhVHYESAlOxAVNI2uC54",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5FPa2yi99nvCF8GJSEq05WJitZ72iyTL_MyOyTc2bDhDE",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5Fl7jvkN-a2PPCCugcctPaVygjQUgs6aG0KTGsXRER_Ow",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5FDf8hYPtF_Ak1NfOpio_Ncn4-TuhK132lkEIETeIszPc",
                "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5F3tBy-IOVg95Tpcr9ahVaSQNMZ8tkYAWZX6vrE_B5-js"
            ]
        }
    }, function (error, response, data) {
        body.data = data;
        body.emit('update');
    });

    body.on('update', function () {
        let msg;
        let arr = body.data.data.searchList.departureFlights.map(({ marketingAirline, fareDetail, departure }) => ({ maskapai: marketingAirline.displayName, harga: fareDetail.cheapestFare, tanggal: departure.date }));
        const sorting = arr.sort(function (a, b) { return a.harga - b.harga });
        res.json(sorting);

        //call top object of array
        const top = sorting.slice(0, 1);
        console.log(top);
        const maskapai = top.map(({ maskapai }) => maskapai)
        const harga = top.map(({ harga }) => harga)
        const tanggal = top.map(({ tanggal }) => tanggal)
        msg = 'halo ikyganteng, ada maskapai *' + maskapai + '* seharga *' + harga + '* ditanggal *' + tanggal + '* , nih kyyy';
        console.log(msg);
        //await sendMessage(msg);
    })
}

async function sendMessageeeeeeeeeeeeeeeeeeee(msg) {
    await request({
        headers: {
            'Content-Type': 'application/json'
        },
        url: "https://api.green-api.com/waInstance1101805072/SendMessage/954ba1ea96ed4a2cb99d655ba09984814564f0bbf1a6456cae",
        method: "POST",
        json: {
            "chatId": "6285277494909@c.us",
            "message": msg
        }
    }, function (error, response, data) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('data:', data); // Print the HTML for the Google homepage.
    });
}

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the servers
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})