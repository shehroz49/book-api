const express = require('express');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Barcha kitoblarni olish (autentifikatsiya shart emas)
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Kitoblar ro'yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       401:
 *         description: Token noto'g'ri yoki muddati o'tgan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Yangi kitob yaratish
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 example: O'tkan kunlar
 *               description:
 *                 type: string
 *                 example: Abdulla Qodiriyning tarixiy romani
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Kitob muvaffaqiyatli yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Kitob muvaffaqiyatli yaratildi
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       401:
 *         description: Token noto'g'ri yoki muddati o'tgan
 */
router.route('/')
  .get(getBooks)
  .post(protect, createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Bitta kitobni olish (autentifikatsiya shart emas)
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kitob ID
 *     responses:
 *       200:
 *         description: Kitob ma'lumotlari
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Kitob topilmadi
 *   put:
 *     summary: Kitobni yangilash
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kitob ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kitob muvaffaqiyatli yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Kitob muvaffaqiyatli yangilandi
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Kitob topilmadi
 *       403:
 *         description: Bu kitobni tahrirlashga ruxsat yo'q
 *   delete:
 *     summary: Kitobni o'chirish
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kitob ID
 *     responses:
 *       200:
 *         description: Kitob muvaffaqiyatli o'chirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Kitob muvaffaqiyatli o'chirildi
 *       404:
 *         description: Kitob topilmadi
 *       403:
 *         description: Bu kitobni o'chirishga ruxsat yo'q
 */
router.route('/:id')
  .get(getBook)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

module.exports = router;
