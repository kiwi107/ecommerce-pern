const pool = require('../config/db'); // Adjust the path to your db.js file



const getTables = async (req, res) => {
    try{
const tables= await pool.query(`SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    if (tables.rows.length === 0) {
        return res.status(404).json({ message: 'No tables found.' });
      }
  
      res.status(200).json({ tables: tables.rows.map(row => row.table_name) });
    }

    catch(err){
        console.error('Error fetching tables:', err);
        res.status(500).json({ message: 'Server error' });
    }
    
}

const getTableData = async (req, res) => {
    const  tableName  = req.params.table; // e.g. /columns/users
  
    try {
      const result = await pool.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: `Table "${tableName}" not found or has no columns.` });
      }
  
      res.status(200).json({ columns: result.rows });
  
    } catch (err) {
      console.error('Error fetching table columns:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  module.exports={
    getTables,
    getTableData
  }