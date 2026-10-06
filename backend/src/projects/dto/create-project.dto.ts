import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength, ValidateBy, ValidateIf } from 'class-validator';
import { MAX_REPOSITORY_URL_LENGTH, parseGithubRepositoryUrl } from '../../github/repository-url.js';

const trimText = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateProjectDto {
  @Transform(trimText)
  @IsString({
    message: 'O nome do projeto deve ser um texto.',
  })
  @MinLength(3, {
    message: 'O nome do projeto deve ter ao menos 3 caracteres.',
  })
  @MaxLength(100, { message: 'O nome do projeto deve ter no máximo 100 caracteres.' })
  name: string;

  @Transform(trimText)
  @IsString({ message: 'A URL do repositório deve ser um texto.' })
  @MaxLength(MAX_REPOSITORY_URL_LENGTH, { message: 'A URL deve ter no máximo 2048 caracteres.' })
  @ValidateBy({ name: 'githubRepositoryUrl', validator: { validate: value => !!parseGithubRepositoryUrl(value) } },
    { message: 'Informe https://github.com/owner/repo, sem credenciais, porta, parâmetros ou fragmento.' })
  repositoryUrl: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimText)
  @IsString({
    message: 'A descrição do projeto deve ser um texto.',
  })
  @MaxLength(2000, { message: 'A descrição deve ter no máximo 2000 caracteres.' })
  description?: string;
}
