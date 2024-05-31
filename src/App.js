import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const countries = ['us', 'in', 'gb', 'au', 'ca'];
const categories = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];

function App() {
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);

  const fetchArticles = async () => {
    const apiKey = "66bd6be758cb406eab30a52aca74a70b";
    const url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&country=${country}&category=${category}&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();
    setArticles(data.articles);
    setTotalResults(data.totalResults);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(articles);
  
    const wscols = [
      { wch: 20 }, 
      { wch: 20 }, 
      { wch: 30 }, 
      { wch: 50 }, 
      { wch: 50 }  
    ];
    worksheet['!cols'] = wscols;
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Articles');
    XLSX.writeFile(workbook, 'News.xlsx');
  };
  

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape', 
      unit: 'pt', 
      format: 'a4'
    });
  
    doc.autoTable({
      head: [['Source', 'Author', 'Title', 'Description', 'URL']],
      body: articles.map(article => [
        article.source.name,
        article.author,
        article.title,
        article.description || "No Data Found",
        article.url
      ]),
      styles: { fontSize: 10 }, 
      columnStyles: {
        0: { cellWidth: 100 }, 
        1: { cellWidth: 100 }, 
        2: { cellWidth: 150 }, 
        3: { cellWidth: 200 }, 
        4: { cellWidth: 200 }  
      }
    });
  
    doc.save('News.pdf');
  };

  return (
    <div className="container">
      <h2 className="my-4 text-center">Search Top Headlines</h2>
      <form>
        <div className="form-group my-3">
          <label htmlFor="country">Country:</label>
          <select id="country" className="form-control" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Select Country</option>
            {countries.map((countryCode) => (
              <option key={countryCode} value={countryCode}>{countryCode.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="form-group my-3">
          <label htmlFor="category">Category:</label>
          <select id="category" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map((categoryName) => (
              <option key={categoryName} value={categoryName}>{categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={fetchArticles}>Search</button>
        <p style={{marginTop: '20px'}}>Total Number of Records: {totalResults}</p>
      </form>

      <div className="mt-4">
        {articles.length === 0 ? (
          <p>No Record Found</p>
        ) : (
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Source</th>
                <th>Author</th>
                <th>Title</th>
                <th>Description</th>
                <th>Image</th>
                <th>ImageUrl</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, index) => (
                <tr key={index}>
                  <td>{article.source.name}</td>
                  <td>{article.author}</td>
                  <td>{article.title}</td>
                  <td>{!article.description ? "No Data Found" : article.description}</td>
                  <td>
                    <img src={!article.urlToImage ? "https://www.livemint.com/lm-img/img/2024/05/26/1600x900/Cyclone_Remal_1716685044781_1716685045021.jpg" : article.urlToImage} alt={article.title} style={{ width: '100px', height: '100px' }} />
                  </td>
                  <td>
                    <a href={article.url} className="btn btn-success" target="_blank" rel="noopener noreferrer">Read</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-secondary"
          disabled={page === 1}
          onClick={() => {
            setPage(page - 1);
            fetchArticles();
          }}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setPage(page + 1);
            fetchArticles();
          }}
        >
          Next
        </button>
      </div>
      <div className="mt-4">
        <button className="btn btn-success mr-2" onClick={exportToExcel}>Export to Excel</button>
        <button className="btn btn-danger mx-3" onClick={exportToPDF}>Export to PDF</button>
      </div>
    </div>
  );
}

export default App;
