import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString({
    message: 'O nome do projeto deve ser um texto.',
  })
  @MinLength(3, {
    message: 'O nome do projeto deve ter ao menos 3 caracteres.',
  })
  name: string;

  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    {
      message: 'Informe uma URL válida, com https://github.com/owner/repo.',
    },
  )
  repositoryUrl: string;

  @IsOptional()
  @IsString({
    message: 'A descrição do projeto deve ser um texto.',
  })
  description?: string;
}
