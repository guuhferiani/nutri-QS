export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Nutricionista = {
  id: string
  nome: string
  email: string
  created_at: string
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      nutricionistas: {
        Row: {
          id: string
          nome: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          id: string
          nutricionista_id: string
          nome: string
          data_nascimento: string | null
          sexo: string | null
          telefone: string | null
          whatsapp: string | null
          email: string | null
          peso_inicial: number | null
          altura: number | null
          objetivos: string[] | null
          objetivo_texto: string | null
          nivel_atividade: string | null
          patologias: string[] | null
          restricoes_alimentares: string[] | null
          alergias: string[] | null
          medicamentos: string | null
          suplementos: string | null
          refeicoes_por_dia: number | null
          horario_acorda: string | null
          horario_dorme: string | null
          litros_agua: number | null
          atividade_fisica: boolean | null
          atividade_fisica_descricao: string | null
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nutricionista_id: string
          nome: string
          data_nascimento?: string | null
          sexo?: string | null
          telefone?: string | null
          whatsapp?: string | null
          email?: string | null
          peso_inicial?: number | null
          altura?: number | null
          objetivos?: string[] | null
          objetivo_texto?: string | null
          nivel_atividade?: string | null
          patologias?: string[] | null
          restricoes_alimentares?: string[] | null
          alergias?: string[] | null
          medicamentos?: string | null
          suplementos?: string | null
          refeicoes_por_dia?: number | null
          horario_acorda?: string | null
          horario_dorme?: string | null
          litros_agua?: number | null
          atividade_fisica?: boolean | null
          atividade_fisica_descricao?: string | null
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nutricionista_id?: string
          nome?: string
          data_nascimento?: string | null
          sexo?: string | null
          telefone?: string | null
          whatsapp?: string | null
          email?: string | null
          peso_inicial?: number | null
          altura?: number | null
          objetivos?: string[] | null
          objetivo_texto?: string | null
          nivel_atividade?: string | null
          patologias?: string[] | null
          restricoes_alimentares?: string[] | null
          alergias?: string[] | null
          medicamentos?: string | null
          suplementos?: string | null
          refeicoes_por_dia?: number | null
          horario_acorda?: string | null
          horario_dorme?: string | null
          litros_agua?: number | null
          atividade_fisica?: boolean | null
          atividade_fisica_descricao?: string | null
          observacoes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pacientes_nutricionista_id_fkey'
            columns: ['nutricionista_id']
            isOneToOne: false
            referencedRelation: 'nutricionistas'
            referencedColumns: ['id']
          },
        ]
      }
      consultas: {
        Row: {
          id: string
          paciente_id: string
          data_consulta: string
          peso: number | null
          cintura: number | null
          quadril: number | null
          percentual_gordura: number | null
          observacoes: string | null
          proximo_retorno: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          data_consulta: string
          peso?: number | null
          cintura?: number | null
          quadril?: number | null
          percentual_gordura?: number | null
          observacoes?: string | null
          proximo_retorno?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          data_consulta?: string
          peso?: number | null
          cintura?: number | null
          quadril?: number | null
          percentual_gordura?: number | null
          observacoes?: string | null
          proximo_retorno?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'consultas_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
        ]
      }
      planos_alimentares: {
        Row: {
          id: string
          paciente_id: string
          conteudo: Json
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          conteudo: Json
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          conteudo?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'planos_alimentares_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
