import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {  complementarConvidado, Convidado, Data, Evento, eventos, Id } from 'core';
import { EventoPrisma } from './evento.prisma';

@Controller('eventos')
export class EventosController {
    constructor(readonly repo: EventoPrisma) {}
    @Post()
    async salvarEvento(@Body() evento: Evento) {
        const eventoCadastrado = eventos.find(
           (ev) => ev.alias === evento.alias
        );   
        if(eventoCadastrado && eventoCadastrado.id !== evento.id) {
            throw new Error('Já existe um evento com esse alias');
        }
        const eventoCompleto = this.deserializar(evento);
        eventos.push(eventoCompleto);
        return this.serializar(eventoCompleto);
    }
    @Post(':alias/convidado')
    async salvarConvidado(
        @Param('alias') alias: string,
        @Body() convidado: Convidado) 
        {
        const evento = await this.repo.buscarPorAlias(alias);
        if(!evento){
            throw new Error('Evento não encontrado');
        }
        // const convidadoCompleto = this.deserializar(convidado);
        
        const convidadoCompleto = complementarConvidado(
            this.deserializar(convidado),
        );

       return this.repo.salvarConvidado(evento, convidadoCompleto);

    }

    @Post('acessar')
    async acessarEvento(@Body() dados: {id: string, senha: string}) {
        const evento = await this.repo.buscarPorId(dados.id);
        if(!evento){
            throw new Error('Evento nao encontrado');
        }
        if(evento.senha !== dados.senha){
            throw new Error('Senha não corresponde ao evento');
        }
        return  this.serializar(evento) 
        

    }
    @Get()
    async buscarEventos() {
        const eventos = await this.repo.buscarTodos();
        return eventos.map(this.serializar);
        
    }
    @Get(':idOuAlias')
    async buscarEvento(@Param('idOuAlias') idOuAlias: string) {
        let evento: Evento;
        if(Id.valido(idOuAlias)) {
            evento = await this.repo.buscarPorId(idOuAlias, true);
        }else{
            evento = await this.repo.buscarPorAlias(idOuAlias, true);   
        }
        return this.serializar(evento);
    }

@Get('validar/:alias/:id')
async validarAlias(@Param('alias') alias: string, @Param('id') id: string) {
  const evento = await this.repo.buscarPorAlias(alias);
  return {valido: !evento || evento.id === id};
}

    private serializar(evento: Evento) {
        if(!evento) return null;
        return {
            ...evento,
            data: Data.formatar(evento.data),
        };
    }
    private deserializar(evento: any): Evento {
        if(!evento) return null;
        return {
            ...evento,
            data: Data.desformatar(evento.data),
        } as Evento;
    }


}
