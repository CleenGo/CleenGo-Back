import {  PartialType } from "@nestjs/swagger";
import { CreatePlanDto } from "./create-suscription-plan.dto";

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
} 