const express = require('express');
const EntrepriseController = require('../controllers/entrepriseController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Entreprise:
 *       type: object
 *       required:
 *         - nom_entreprise
 *         - id_activite
 *       properties:
 *         id_entreprise:
 *           type: string
 *           description: Numéro d'entreprise KBO (format 0XXX.XXX.XXX)
 *         nom_entreprise:
 *           type: string
 *           description: Nom officiel de l'entreprise
 *         id_activite:
 *           type: string
 *           description: Code NACE de l'activité principale
 *         adresse:
 *           type: string
 *           description: Adresse du siège social
 *         code_postal:
 *           type: string
 *           description: Code postal
 *         commune:
 *           type: string
 *           description: Commune
 *         date_creation:
 *           type: string
 *           format: date
 *           description: Date de création
 *         statut:
 *           type: string
 *           description: Statut (AC = Active)
 */

/**
 * @swagger
 * /api/entreprises:
 *   get:
 *     summary: Récupère toutes les entreprises
 *     tags: [Entreprises]
 *     responses:
 *       200:
 *         description: Liste des entreprises
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Entreprise'
 */
router.get('/', EntrepriseController.getAllEntreprises);

/**
 * @swagger
 * /api/entreprises/{id}:
 *   get:
 *     summary: Récupère une entreprise par son ID
 *     tags: [Entreprises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro d'entreprise KBO
 *     responses:
 *       200:
 *         description: Entreprise trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entreprise'
 *       404:
 *         description: Entreprise non trouvée
 */
router.get('/:id', EntrepriseController.getEntreprise);

/**
 * @swagger
 * /api/entreprises:
 *   post:
 *     summary: Crée une nouvelle entreprise
 *     tags: [Entreprises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom_entreprise
 *               - id_activite
 *             properties:
 *               id_entreprise:
 *                 type: string
 *               nom_entreprise:
 *                 type: string
 *               id_activite:
 *                 type: string
 *               adresse:
 *                 type: string
 *               code_postal:
 *                 type: string
 *               commune:
 *                 type: string
 *               statut:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entreprise créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', EntrepriseController.createEntreprise);

/**
 * @swagger
 * /api/entreprises/{id}:
 *   put:
 *     summary: Met à jour une entreprise
 *     tags: [Entreprises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro d'entreprise KBO
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_entreprise:
 *                 type: string
 *               id_activite:
 *                 type: string
 *               adresse:
 *                 type: string
 *               code_postal:
 *                 type: string
 *               commune:
 *                 type: string
 *               statut:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entreprise mise à jour
 *       404:
 *         description: Entreprise non trouvée
 */
router.put('/:id', EntrepriseController.updateEntreprise);

/**
 * @swagger
 * /api/entreprises/{id}:
 *   delete:
 *     summary: Supprime une entreprise
 *     tags: [Entreprises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro d'entreprise KBO
 *     responses:
 *       200:
 *         description: Entreprise supprimée
 *       404:
 *         description: Entreprise non trouvée
 */
router.delete('/:id', EntrepriseController.deleteEntreprise);

module.exports = router;
