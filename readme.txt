The Apricot is a REST API in node.js for mongodb. It was created to expose mongodb as a resource. Also, it aimed to help with easier access to docs/collections, flexible iterations and quick aggregations using Map-reduce.

To run the server:
  - node app.js

Usage:
{
    "/" : "help",
    "/cols[?page={num_of_pages}][&per_page={records_per_page}]" : {
      "get" : "Show all collections"
    },
    "/col/{collection_name}" : {
      "post" : "create collection",
      "delete" : "delete collection",
      "put" : "rename collection"
    },
    "/col/{collection_name}/files" : {
      "get" : "get metadata of all files in the collection",
      "post" : "query metadata of all files in the collection"
    },
    "/col/{collection_name}/file/{file_name}" : {
      "post" : "upload file (overwrite)",
      "delete" : "delete file",
      "get" : "download file"
    },
    "/col/{collection_name}/docs[?page={num_of_pages}][&per_page={records_per_page}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "get docs",
      "post" : "query docs",
      "put" : "insert docs",
      "patch" : "partially update docs. req.body[0] is search pattern and req.body[1] is patching action",
      "delete" : "delete docs. (optionally by a query as req.body)"
    },
    "/col/{collection_name}/doc/{document_id}" : {
      "get" : "find doc by Id",
      "post" : "insert doc by Id",
      "put" : "replace entire doc by Id",
      "delete" : "delete doc by Id"
    },
    "/col/{collection_name}/next[?page={num_of_pages}][&per_page={records_per_page}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "Get the next record(s) (without isolation)",
      "post" : "Get the next record(s) for the query (without isolation)"
    },
    "/reset" : "Reset the cursor for the session",
    "/col/{collection_name}/count?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "get count of all documents in a collection",
      "post" : "get the count of the query results"
    },
    "/col/{collection_name}/max?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "calculate max of a property upon all docs",
      "post" : "calculate max of a property upon the query results"
    },
    "/col/{collection_name}/min?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "calculate min of a property upon all docs",
      "post" : "calculate min of a property upon the query results"
    },
    "/col/{collection_name}/sum?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "calculate sum of a property upon all docs",
      "post" : "calculate sum of a property upon the query results"
    },
    "/col/{collection_name}/avg?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "calculate avgerage of a property upon all docs",
      "post" : "calculate average of a property upon the query results"
    }
}
