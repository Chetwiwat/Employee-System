import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { MasterGender } from '../entities/master-gender.entity.js';
import { MasterPosition } from '../entities/master-position.entity.js';
import { MasterPrefix } from '../entities/master-prefix.entity.js';
import { MasterService } from './master.service.js';

// Lookup data for dropdowns
@Resolver()
export class MasterResolver {
  constructor(private readonly service: MasterService) {}

  @Query(() => [MasterGender])
  genders() {
    return this.service.findGenders();
  }

  @Query(() => [MasterPosition])
  positions() {
    return this.service.findPositions();
  }

  @Query(() => [MasterPrefix], {
    description: 'Prefixes, optionally only those for one gender',
  })
  prefixes(
    @Args('genderId', { type: () => Int, nullable: true }) genderId?: number,
  ) {
    return this.service.findPrefixes(genderId ?? undefined);
  }
}
