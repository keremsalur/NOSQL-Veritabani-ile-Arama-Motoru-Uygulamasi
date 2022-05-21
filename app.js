//----------------------------------------------------------------------------app.js------------------------------------------------------------
const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser');
const app = express()
const neo4j = require('neo4j-driver');
app.set('view engine','ejs')

app.listen(3000)

app.use(express.static('public'))
app.use(express.static('node_modules'))
app.use(express.urlencoded({extended : true}))
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',async (req,res) => {
    //res.sendFile('/views/index.html',{root:__dirname})
    //console.log(req.body.search)
    if(req.query.search){
        
        res.render('view',{title: req.query.search} )
    }
    else if(req.query.username && req.query.password){
        res.redirect('admin')
    }
    else{
        let data = await getAllData()
        console.log(data)
        res.render('index',{allData: JSON.stringify(data)})
    }
        
})

app.get('/admin' , async (req,res) =>{
    res.render('admin',{search: "MATCH (n)-[r]->(m),(a) RETURN n,r,m,a"})
})

app.get('/succes', (req,res) => {
  res.redirect('admin')
})

app.post('/admin', async (req,res) =>{
    console.log(req.body)
    if(req.body.researcherName){
      console.log("Araştırmacı eklenecek")
      if(await nodeExist("r",[req.body.researcherName]))
        console.log("Bu kayıt daha önce yapılmış")
      else{
        nodeCreate("r",[req.body.researcherName])
      }
    }
    else if(req.body.articleName && req.body.articleYear){
      console.log("Yayın eklenecek")
      if(await nodeExist("a",[req.body.articleName,req.body.articleYear])){
        console.log("Bu kayıt daha önce yapılmış")
      }
      else{
        nodeCreate("a",[req.body.articleName,req.body.articleYear])
      }
    }
    else if(req.body.publisherName && req.body.publisherType){
      console.log("Yayın Evi Eklenecek")
      if(await nodeExist("p",[req.body.publisherName,req.body.publisherType])){
        console.log("Bu kayıt daha önce yapılmış")
      }
      else{
        nodeCreate("p",[req.body.publisherName,req.body.publisherType])
      }
    }
    else if(req.body.rName && req.body.articleName){
      console.log("ilişki kurulacak");
      if(await reletionshipExist("RtoA",[req.body.rName,req.body.articleName])){
        console.log("ilişki zaten var");
      }
      else{
        reletionshipCreate("PtoP",[req.body.rName,req.body.articleName]);
        reletionshipCreate("RtoA",[req.body.rName,req.body.articleName]);
      }
    }
    else if(req.body.articleNames && req.body.publisherType && req.body.publisher){
      if(await reletionshipExist("AtoP",[req.body.articleNames,req.body.publisherType,req.body.publisher])){
        console.log("ilişki zaten var");
      }
      else{
        reletionshipCreate("AtoP",[req.body.articleNames,req.body.publisherType,req.body.publisher]);
      }
    }
    res.redirect('succes')
})


async function getAllData(){
    const neo4j = require('neo4j-driver');
    const uri = '[Veritabani-Url-Yazin]';
    const user = '[Kullanici-Adi-Yazin]';
    const password = '[Sifre-Yazin]';
    
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
    const session = driver.session()
    let resList = [];
    try {
        const readQuery = `MATCH (n) RETURN n`
        const readResult = await session.readTransaction(tx =>
          tx.run(readQuery)
        )
        readResult.records.forEach(record => {
          resList.push(record);
        })
        await session.close()
        await driver.close()
        return resList
      } catch (error) {
        console.error('Something went wrong: ', error)
      } finally {
        await session.close()
      }
     
      // Don't forget to close the driver connection when you're finished with it
      await driver.close()
    //return readResult.record.length
}

async function nodeExist(key,param){
    const neo4j = require('neo4j-driver');
    const uri = '[Veritabani-Url-Yazin]';
    const user = '[Kullanici-Adi-Yazin]';
    const password = '[Sifre-Yazin]';
    
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
    const session = driver.session()
    let resList = [];
    try {
        var readQuery = ""
        if(key == "r")
          readQuery = "MATCH (r:Researcher) WHERE r.name ='" + param[0] + "' RETURN (r)"
        else if( key == "a")
          readQuery = "MATCH (a:Article) WHERE a.name ='" + param[0] + "' AND a.year = "+ param[1] +" RETURN (a)"
        else if (key == "p")
          readQuery = "MATCH (p:Type) WHERE p.name ='" + param[1] + "' AND p.publisher= '"+ param[0] +"' RETURN (p)"
        const readResult = await session.readTransaction(tx =>
          tx.run(readQuery)
        )
        await session.close()
        await driver.close()
        return readResult.records.length
      } catch (error) {
        console.error('Something went wrong: ', error)
      } finally {
        await session.close()
      }
      await driver.close()
}

async function reletionshipExist(key,param){
  const neo4j = require('neo4j-driver');
  const uri = '[Veritabani-Url-Yazin]';
  const user = '[Kullanici-Adi-Yazin]';
  const password = '[Sifre-Yazin]';
  
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session()
  let resList = [];
  try {
      var readQuery = ""
      if(key == "RtoA")
        readQuery = "MATCH (n:Researcher)-[r:YayınYazarı]->(m:Article) WHERE n.name = '"+ param[0] +"' AND m.name = '"+ param[1] +"' RETURN (r)"
      else if( key == "AtoP")
        readQuery = "MATCH (a:Article)-[r:`Yayınlanır`]->(t:Type) WHERE a.name = '"+ param[0] +"' AND t.name = '"+ param[1] +"' AND t.publisher = '"+ param[2] +"' RETURN (r)"
      const readResult = await session.readTransaction(tx =>
        tx.run(readQuery)
      )
      await session.close()
      await driver.close()
      console.log(readResult.records.length)
      return readResult.records.length
    } catch (error) {
      console.error('Something went wrong: ', error)
    } finally {
      await session.close()
    }
    await driver.close()
}


async function nodeCreate(key,param){
  const neo4j = require('neo4j-driver');
  const uri = '[Veritabani-Url-Yazin]';
  const user = '[Kullanici-Adi-Yazin]';
  const password = '[Sifre-Yazin]';
    
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
    const session = driver.session()
    try {
        var query = ""
        if(key == "r")
          query = "CREATE (r:Researcher {name:'" + param[0] + "'})"
        else if( key == "a")
          query = "CREATE (a:Article {name:'" + param[0] + "', year: "+ param[1] +"})"
        else if (key == "p")
          query = "CREATE (p:Type {name:'"+ param[1] +"', publisher:'"+ param[0] +"'})"
        const readResult = await session.readTransaction(tx =>
          tx.run(query)
        )
      } catch (error) {
        console.error('Something went wrong: ', error)
      } finally {
        await session.close()
      }
      await driver.close()
}

async function reletionshipCreate(key,param){
  const neo4j = require('neo4j-driver');
  const uri = '[Veritabani-Url-Yazin]';
  const user = '[Kullanici-Adi-Yazin]';
  const password = '[Sifre-Yazin]';
    
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
    const session = driver.session()
    try {
        var query = ""
        if(key == "RtoA")
          query = "MATCH (r:Researcher),(a:Article) WHERE r.name = '"+ param[0] +"' AND a.name = '"+ param[1] +"' CREATE (r)-[w:YayınYazarı]->(a)"
        else if( key == "AtoP")
          query = "MATCH (a:Article),(t:Type) WHERE a.name = '"+ param[0] +"' AND t.name = '"+ param[1] +"' AND t.publisher = '"+ param[2] +"' CREATE (a)-[r:Yayınlanır]->(t)"
        else if (key == "PtoP")
          query = "MATCH  (n)-[r]->(m),(a) WHERE r:YayınYazarı AND m.name = '"+ param[1] +"' AND  a.name = '"+ param[0] +"' FOREACH (x IN [n] | CREATE (a)-[t:OrtakÇalışır]->(x))"
        const readResult = await session.readTransaction(tx =>
          tx.run(query)
        )
      } catch (error) {
        console.error('Something went wrong: ', error)
      } finally {
        await session.close()
      }
      await driver.close()
} 