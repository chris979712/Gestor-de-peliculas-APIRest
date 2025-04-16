import zod from 'zod'

const movieSchema = zod.object({
    title: zod.string({
        invalid_type_error: 'Movie tittle must be a string',
        required_error: 'Movie tittle is required'
    }),
    year: zod.number().int().positive().min(1900).max(2025),
    director: zod.string(),
    duration: zod.number().int().positive().min(30).max(300),
    rate: zod.number().min(0).max(10).default(0),
    poster: zod.string().url().endsWith('.jpg' || '.png'),
    genre: zod.array(zod.enum(['Action','Adventure','Comedy','Drama','Fantasy','Horror','Thriller']))
})

export function validateMovie(input){
    return movieSchema.safeParse(input);
}

export function validatePartialMovie(input){
    return movieSchema.partial().safeParse(input);
}

