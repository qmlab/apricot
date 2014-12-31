The Apricot is a REST API in node.js for mongodb. It was created to expose mongodb as a resource. Also, it aimed to help with easier access to docs/collections, flexible iterations and quick aggregations using Map-reduce.

To run the server:
  - node app.js

Usage:
{
    "/" : "help",
    "/sets[?page={num_of_pages}][&per_page={records_per_page}]" : {
      "get" : "Show all sets"
    },
    "/set/{set_name}" : {
      "post" : "create set",
      "delete" : "delete set",
      "put" : "rename set"
    },
    "/set/{set_name}/files" : {
      "get" : "get metadata of all files in the set",
      "post" : "query metadata of all files in the set"
    },
    "/set/{set_name}/file/{file_name}" : {
      "post" : "upload file (overwrite)",
      "delete" : "delete file",
      "get" : "download file"
    },
    "/set/{set_name}/items[?page={num_of_pages}][&per_page={records_per_page}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "get items",
      "post" : "query items",
      "put" : "insert items",
      "patch" : "partially update items. req.body[0] is search pattern and req.body[1] is patching action",
      "delete" : "delete items. (optionally by a query as req.body)"
    },
    "/set/{set_name}/item/{item_id}" : {
      "get" : "find item by Id",
      "post" : "insert item by Id",
      "put" : "replace entire item by Id",
      "delete" : "delete item by Id"
    },
    "/set/{set_name}/places[?page={num_of_pages}][&per_page={records_per_page}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "get locations",
      "post" : "query locations (e.g. Get locations within N meters from a coordinate {'loc':{'$near':{'$geometry':{'type': 'Point', 'coordinates': [ -122.1667, 47.6 ] }, '$maxDistance':10000}}})",
      "put" : "insert locations (must contain 'loc' with 'type' of 'Point': e.g.'loc':{'type': 'Point', 'coordinates': [ -123.1, 49.25 ] })",
      "patch" : "partially update locations. req.body[0] is search pattern and req.body[1] is patching action",
      "delete" : "delete places. (optionally by a query as req.body)"
    },
    "/set/{set_name}/next[?page={num_of_pages}][&per_page={records_per_page}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "Get the next record(s) (without isolation)",
      "post" : "Get the next record(s) for the query (without isolation)"
    },
    "/reset" : "Reset the cursor for the session",
    "/set/{set_name}/count?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "get count of all items in a set",
      "post" : "get the count of the query results"
    },
    "/set/{set_name}/max?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "calculate max of a property upon all items",
      "post" : "calculate max of a property upon the query results"
    },
    "/set/{set_name}/min?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "calculate min of a property upon all items",
      "post" : "calculate min of a property upon the query results"
    },
    "/set/{set_name}/sum?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "calculate sum of a property upon all items",
      "post" : "calculate sum of a property upon the query results"
    },
    "/set/{set_name}/avg?prop={name1}[&groupby={name2}][&orderby={sortkey}][&{desc=1|asc=1}]" : {
      "get" : "calculate avgerage of a property upon all items",
      "post" : "calculate average of a property upon the query results"
    }
}
