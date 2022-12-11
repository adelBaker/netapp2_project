const http = require('http'); // The main server package
const fs = require('fs'); // The file system package, used to deal with files
var mysql = require('mysql');
var formidable = require('formidable');


// To access the server from the browser use: 127.0.0.1:3000
const hostname = '127.0.0.1'; // The server IP
const port =process.env.port|| 3000; // The server port

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'articels',
    multipleStatements: true
    });

// Creating a server
const server = http.createServer((request, response) => {
  // Getting the requested URL from the browser
  let url = request.url;
  
  // The routing
  if(url === '/') { // The home page route
    mysqlConnection.query('SELECT * FROM the_article', (err, rows, fields) => {
      if (!err){
        let res = `
        <!DOCTYPE html>
        <html>
          <head>
            <title > <aArticles information</title>
        
          </head>
          <body>
            <div><a href ="/" >Return Home</a>
            <a href='/add_article'>Add new  article</a>
            <a  href='/articles/delete/${article_id}' ><button >Delete an atricle </a>
              <a href='/articles/update/${article_id}'><button >Update an article </a>
            <h1>all Articles</h1>
            
              <table >
                <tr >
                  <th>Articles</th>
                </tr>
            </div>
        `
        for (var i = 0; i < rows.length; i++) {
            res +="<tr><td><a href='/articles/information/"
                  + rows[i].id+"'>"+rows[i].title
                  + "</a></td></tr>"
        }
        res += "</table></body></html>"
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(res)
      }else {
        console.log(err);
      }
    })



  }else if(url.startsWith("/articles/information/")){
    let split_url =url.split("/")
    let article_id = split_url[split_url.length -1]
    mysqlConnection.query('SELECT * FROM the_article WHERE id='+article_id, (err, rows, fields) => {
      if (!err){
        let res = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Articles informatio</title>
            
          </head>
          <body>
            <div><a href ="/" >Return Home</a>
            
              <h1>Atricle Details</h1>
            </div>
            <table>
              <tr >
                <th> Article </th>
                <th> Authors </th>
                <th> Abstract </th>
                <th> Link </th>
              </tr>
        `
        for (var i = 0; i < rows.length; i++) {
            res +="<tr><td>"
                  + rows[i].title
                  + "</td><td>"
                  + rows[i].authors
                  + "</td><td>"
                  + rows[i].abstract
                  + "</td><td>"
                  + rows[i].link
        }
        res += "</table></body></html>"
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(res)
      }else {
        console.log(err);
      }
    });
}else if(url ==='/add_article') { // The add new hotel page route
    fs.readFile('pages/add_article.html', null, function (error, data) {
      if (error) {
        send_failed_msg(response, 404)
      }else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
      }
    });



 }else if(url === '/add_article_handler'){ // The add new hotel handler
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      let p=fields.authentication_code
      if(p===09388){
      let query = "INSERT INTO the_article (article_title,article_Authors,article_abstract,article_link,authentication code) VALUES (?,?,?,?,?)";
      let values_to_insert = [
        fields.article_title,
        fields.article_Authors,
        fields.article_abstract,
        fields.article_link,
        fields.authentication_code
      ]
      mysqlConnection.query(query, values_to_insert, (err, rows) => {
          if (err) throw err;
      });
    }
    });
  
  }else if(url.startsWith("/articles/delete/")){
    let split_url = url.split("/")
    let article_id = split_url[split_url.length - 1]
    let form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
      let p = fields.authentication_code
      if ( p ==09388 )
      {
        mysqlConnection.query('DELETE FROM the_article WHERE id=' + article_id, (err, rows) => {
          if (err) throw err;
    }); //getting the article ID to delete
          response.statusCode = 302;
          response.setHeader('Location', '/');
          response.end();
      }
      else {
          response.statusCode = 302;
          response.setHeader('Location', '/');
          response.end();
      }
});
}

else if(url.startsWith('/articles/update/')){
    let split_url = url.split("/")
    let article_id = split_url[split_url.length - 1]
    let form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        let p=fields.authentication_code
        if(p===09388)
    mysqlConnection.query("UPDATE articles SET title='"+fields.title+"',authors='"
    +fields.authors+"',abstract='"+fields.absrtact+"',link='"+fields.link+
    "' WHERE id=" + article_id, (err, rows) => {
    if (err) throw err;
    }); //getting the article ID to delete
    
          response.statusCode = 302;
          response.setHeader('Location', '/');
          response.end()
  });
  

  }

else { // If the user entered a page that doesn't exist, send the 'page not found' response
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/html');
    response.end("NOT FOUND !");
  }
})




// Running the server
server.listen(port,  () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});