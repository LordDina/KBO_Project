const express = require('express');
const UniteController = require('../controllers/uniteController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Unite:
 *       type: object
 *       required:
 *         - id_entreprise
 *         - numero_unite
 *         - nom_unite
 *       properties:
 *         id_unite:
 *           type: integer
 *           description: ID auto-généré
 *         id_entreprise:
 *           type: string
 *           description: Numéro d'entreprise KBO
 *         numero_unite:
 *           type: string
 *           description: Numéro d'établissement
 *         nom_unite:
 *           type: string
 *           description: Nom de l'unité
 *         adresse:
 *           type: string
 *           description: Adresse de l'unité
 *         type_unite:
 *           type: string
 *           description: Type d'unité
 *         statut:
 *           type: string
 *           description: Statut de l'unité
 */

/**
 * @swagger
 * /api/entreprises/{id}/unites:
 *   get:
 *     summary: Récupère toutes les unités d'une entreprise
 *     tags: [Unités]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro d'entreprise KBO
 *     responses:
 *       200:
 *         description: Liste des unités
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
 *                     $ref: '#/components/schemas/Unite'
 */
router.get('/:id/unites', UniteController.getUnitesByEntreprise);

/**
 * @swagger
 * /api/entreprises/{id}/unites:
 *   post:
 *     summary: Crée une nouvelle unité pour une entreprise
 *     tags: [Unités]
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
 *             required:
 *               - numero_unite
 *               - nom_unite
 *             properties:
 *               numero_unite:
 *                 type: string
 *               nom_unite:
 *                 type: string
 *               adresse:
 *                 type: string
 *               type_unite:
 *                 type: string
 *               statut:
 *                 type: string
 *     responses:
 *       201:
 *         description: Unité créée avec succès
 */
router.post('/:id/unites', UniteController.createUnite);

/**
 * @swagger
 * /api/entreprises/unites/{id}:
 *   get:
 *     summary: Récupère une unité par son ID
 *     tags: [Unités]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'unité
 *     responses:
 *       200:
 *         description: Unité trouvée
 *       404:
 *         description: Unité non trouvée
 */
router.get('/unites/:id', UniteController.getUnite);

/**
 * @swagger
 * /api/entreprises/unites/{id}:
 *   put:
 *     summary: Met à jour une unité
 *     tags: [Unités]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'unité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_unite:
 *                 type: string
 *               nom_unite:
 *                 type: string
 *               adresse:
 *                 type: string
 *               type_unite:
 *                 type: string
 *               statut:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unité mise à jour
 *       404:
 *         description: Unité non trouvée
 */
router.put('/unites/:id', UniteController.updateUnite);

/**
 * @swagger
 * /api/entreprises/unites/{id}:
 *   delete:
 *     summary: Supprime une unité
 *     tags: [Unités]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'unité
 *     responses:
 *       200:
 *         description: Unité supprimée
 *       404:
 *         description: Unité non trouvée
 */
router.delete('/unites/:id', UniteController.deleteUnite);

module.exports = router;
