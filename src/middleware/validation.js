export const validateRequest = (requiredFields = []) => {
    return (req, res, next) => {
        try {
            const body = req.body;

            // Validar campos requeridos
            const missingFields = requiredFields.filter(field => {
                return !body[field] || body[field] === '';
            });

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos requeridos faltantes',
                    fields: missingFields,
                });
            }

            next();
        } catch (error) {
            res.status(400).json({ error: 'Error en la validación' });
        }
    };
};

export const validateQueryParams = (requiredParams = []) => {
    return (req, res, next) => {
        try {
            const query = req.query;

            const missingParams = requiredParams.filter(param => {
                return !query[param] || query[param] === '';
            });

            if (missingParams.length > 0) {
                return res.status(400).json({
                    error: 'Parámetros requeridos faltantes',
                    params: missingParams,
                });
            }

            next();
        } catch (error) {
            res.status(400).json({ error: 'Error en la validación' });
        }
    };
};
