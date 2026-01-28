const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.errors,
        });
    }

    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'Ya existe un registro con esos datos',
        });
    }

    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};

export default errorHandler;