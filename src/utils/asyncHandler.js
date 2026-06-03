// asyncHandler is a higher-order function that wraps async route handlers

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) =>
            next(error)
        );
    };
};

export { asyncHandler };

// const asyncHandler = () => {}
// const asyncHandler = () => {() => {}}
// const asyncHandler = () => () = {}
// const asyncHandler = () => async() = {}

/*
const asyncHandler = (fn) => async(error, req, res, next) => {
    try{
        await fn(req, res, next);
    }catch(error){
        res.status(err.code||500).json({
            success: false,
            message: err.message
        })
    }
}
    */
