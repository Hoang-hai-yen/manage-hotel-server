const db = require('../db');

// GET all services
exports.getServices = (req, res) => {
  db.query('SELECT * FROM Service', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// POST create service
exports.createService = (req, res) => {
  const { serviceID, serviceName, servicePrice } = req.body;
  db.query('INSERT INTO Service (serviceID, serviceName, servicePrice) VALUES (?, ?, ?)', [serviceID, serviceName, servicePrice], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ serviceID, serviceName, servicePrice });
  });
};

// PUT update service
exports.updateService = (req, res) => {
  const { serviceID } = req.params;
  const { serviceName, servicePrice } = req.body;
  db.query('UPDATE Service SET serviceName=?, servicePrice=? WHERE serviceID=?', [serviceName, servicePrice, serviceID], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ serviceID, serviceName, servicePrice });
  });
};

// DELETE service
exports.deleteService = (req, res) => {
  const { serviceID } = req.params;
  db.query('DELETE FROM Service WHERE serviceID=?', [serviceID], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Service deleted' });
  });
};