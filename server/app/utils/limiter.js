
const Limiter=require('express-rate-limit')

const limiter=Limiter({
    windowMs: 2 * 60 * 1000, 
	limit: 50, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	ipv6Subnet: 56, 
    message: 'Too many requests. Please try after 2 minute .'
})



module.exports=limiter