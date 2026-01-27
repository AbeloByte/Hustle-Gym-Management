import db from "../config/db/db.js";


// member management model
class MemberModel{
  /**
   * Create a new member in the database.
   * @param {Object} memberData - Member info
   * @param {string} memberData.full_name
   * @param {string} memberData.phone_number
   * @param {string} memberData.member_code
   * @param {string} memberData.gender
   * @param {string} memberData.emergency_contact
   * @returns {Object} Created member row
   */

  async createUser(memberData){
    const {full_name, phone_number, member_code, gender, emergency_contact} = memberData;
    // Insert member into the database
    const query = `
      INSERT INTO members (full_name, phone_number, member_code, gender, emergency_contact)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;
    //   insert values
    const values = [full_name, phone_number, member_code, gender, emergency_contact];
    // execute query
    const result = await db.query(query, values);
    // return created member
    return result.rows[0];
  }

   /**
   * Get all members from the database.
   * This could be static because it doesn't rely on instance data.
   * @returns {Array} List of members
   */

   async findAll(){
    try {
       const res = await db.query('SELECT * FROM members');
      return res.rows;
    } catch (err) {
      throw new Error(`Error fetching members: ${err.message}`);
    }
  }
   }


   modules.exports = MemberModel;
