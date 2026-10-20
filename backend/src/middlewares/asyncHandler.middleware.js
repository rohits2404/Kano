export const asyncHandler = (controller) => (request, response, next) => {
    controller(request, response, next).catch(next);
};
