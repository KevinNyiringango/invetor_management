const cds = require('@sap/cds');

/**
 * Companies Service Handler
 * @module companiesService
 * @param {Service} srv - The CDS service instance
 */
module.exports = (srv) => {
  const { Company } = srv.entities;

  /**
   * Before CREATE handler for Companies
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.before('CREATE', 'Company', async (req) => {
    const { Name } = req.data;
    if (!Name) {
      return req.reject(400, 'error.missingRequiredFields');
    }
  });

  /**
   * Before UPDATE handler for Companies
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.before('UPDATE', 'Company', async (req) => {
    const { ID } = req.data;
    const existingCompany = await SELECT.from(Company).where({ ID });

    if (!existingCompany.length) {
      return req.reject(404, 'error.companyNotFound', [ID]);
    }

    const { Name } = req.data;

    if (Name !== undefined && !Name.trim()) {
      return req.reject(400, 'error.emptyCompanyName');
    }

    await UPDATE(Company)
      .set({
        Name: Name ?? existingCompany[0].Name,
        Address: req.data.Address ?? existingCompany[0].Address,
      })
      .where({ ID });
  });

  /**
   * DELETE handler for Companies
   * @param {Request} req - The request object
   * @returns {Promise<string>}
   */
  srv.on('DELETE', 'Company', async (req) => {
    const { ID } = req.data;
    const existingCompany = await SELECT.from(Company).where({ ID });

    if (!existingCompany.length) {
      return req.reject(404, 'error.companyNotFound', [ID]);
    }

    await DELETE.from(Company).where({ ID });
    return 'error.companyDeleted';
  });
};