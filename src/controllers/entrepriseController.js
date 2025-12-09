const EntrepriseService = require('../services/entrepriseService');

class EntrepriseController {
  static async createEntreprise(req, res) {
    try {
      const { id_entreprise, nom_entreprise, id_activite, adresse, code_postal, commune } = req.body;

      if (!id_entreprise || !nom_entreprise || !id_activite) {
        return res.status(400).json({
          error: 'Les champs id_entreprise, nom_entreprise et id_activite sont obligatoires'
        });
      }

      const result = await EntrepriseService.createEntreprise({
        id_entreprise,
        nom_entreprise,
        id_activite,
        adresse,
        code_postal,
        commune,
      });

      res.status(201).json({
        success: true,
        message: 'Entreprise créée avec succès',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getEntreprise(req, res) {
    try {
      const { id } = req.params;
      const entreprise = await EntrepriseService.getEntrepriseById(id);

      res.status(200).json({
        success: true,
        data: entreprise,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAllEntreprises(req, res) {
    try {
      const { statut, id_activite, search } = req.query;
      const filters = {};

      if (search) filters.search = search;
      if (statut) filters.statut = statut;
      if (id_activite) filters.id_activite = id_activite;

      const entreprises = await EntrepriseService.getAllEntreprises(filters);
      const totalCount = await EntrepriseService.getTotalCount();

      res.status(200).json({
        success: true,
        count: totalCount,
        data: entreprises,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateEntreprise(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await EntrepriseService.updateEntreprise(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Entreprise mise à jour avec succès',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async deleteEntreprise(req, res) {
    try {
      const { id } = req.params;
      const result = await EntrepriseService.deleteEntreprise(id);

      res.status(200).json({
        success: true,
        message: result.message,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = EntrepriseController;
