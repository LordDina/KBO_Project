const UniteService = require('../services/uniteService');

class UniteController {
  static async createUnite(req, res) {
    try {
      const { id: id_entreprise } = req.params;
      const { id_unite, numero_unite, nom_unite, adresse, code_postal, commune, type_unite } = req.body;

      if (!id_unite || !nom_unite) {
        return res.status(400).json({
          error: 'Les champs id_unite et nom_unite sont obligatoires'
        });
      }

      const result = await UniteService.createUnite({
        id_unite,
        id_entreprise,
        numero_unite: numero_unite || 1,
        nom_unite,
        adresse,
        code_postal,
        commune,
        type_unite: type_unite || 'succursale',
      });

      res.status(201).json({
        success: true,
        message: 'Unité créée avec succès',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getUnite(req, res) {
    try {
      const { id } = req.params;
      const unite = await UniteService.getUniteById(id);

      res.status(200).json({
        success: true,
        data: unite,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getUnitesByEntreprise(req, res) {
    try {
      const { id } = req.params;
      const unites = await UniteService.getUnitesByEntreprise(id);

      res.status(200).json({
        success: true,
        count: unites.length,
        data: unites,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateUnite(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await UniteService.updateUnite(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Unité mise à jour avec succès',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async deleteUnite(req, res) {
    try {
      const { id } = req.params;
      const result = await UniteService.deleteUnite(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = UniteController;
