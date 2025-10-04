import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from '@app/shared/database';
import { VisitorController } from './visitor.controller';
import { VisitorService } from './visitor.service';
import { BaseRepository } from '@app/shared/repositories';
import { VisitorRepository } from './visitor.repository';

@Module({
    imports: [SharedDatabaseModule],
    controllers: [VisitorController],
    providers: [VisitorService, VisitorRepository],
    exports: [VisitorService],
})
export class VisitorModule {}
