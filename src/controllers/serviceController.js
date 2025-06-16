const db = require('../db');

// GET all services
exports.getServices = (req, res) => {
  db.query('SELECT * FROM services', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// POST create service
exports.createService = (req, res) => {
  const { service_id, service_name, price_service } = req.body;
  db.query(
    'INSERT INTO services (service_id, service_name, price_service) VALUES (?, ?, ?)',
    [service_id, service_name, price_service],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ service_id, service_name, price_service });
    }
  );
};

// PUT update service
exports.updateService = (req, res) => {
  const { service_id } = req.params;
  const { service_name, price_service } = req.body;
  db.query(
    'UPDATE services SET service_name=?, price_service=? WHERE service_id=?',
    [service_name, price_service, service_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ service_id, service_name, price_service });
    }
  );
};

// DELETE service
exports.deleteService = (req, res) => {
  const { service_id } = req.params;
  db.query('DELETE FROM services WHERE service_id=?', [service_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Service deleted' });
  });
};
